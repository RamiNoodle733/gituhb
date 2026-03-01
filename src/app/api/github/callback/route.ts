import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { fetchGitHubUserProfile, fetchUserRepos } from "@/lib/github"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin
  const code = requestUrl.searchParams.get("code")
  const stateParam = requestUrl.searchParams.get("state")

  // Read and parse the OAuth state cookie
  const cookieStore = await cookies()
  const stateCookie = cookieStore.get("github_oauth_state")

  let expectedState: string | null = null
  let returnTo = "/dashboard/settings"

  if (stateCookie?.value) {
    try {
      const parsed = JSON.parse(stateCookie.value)
      expectedState = parsed.state
      returnTo = parsed.returnTo || "/dashboard/settings"
    } catch {
      // Invalid cookie JSON
    }
  }

  // Verify the state parameter matches
  if (!stateParam || !expectedState || stateParam !== expectedState) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=invalid_state`, origin)
    )
  }

  // Verify we have a code
  if (!code) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=missing_code`, origin)
    )
  }

  // Get the current session
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=unauthorized`, origin)
    )
  }

  // Exchange the code for an access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.AUTH_GITHUB_ID!,
        client_secret: process.env.AUTH_GITHUB_SECRET!,
        code,
      }),
    }
  )

  const tokenData = await tokenResponse.json()

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=token_exchange_failed`, origin)
    )
  }

  const access_token = tokenData.access_token as string

  // Fetch the GitHub user profile
  const githubUserResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${access_token}`,
      Accept: "application/vnd.github.v3+json",
    },
  })

  if (!githubUserResponse.ok) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=github_fetch_failed`, origin)
    )
  }

  const githubUser = await githubUserResponse.json()

  // Upsert the Account record
  await prisma.account.upsert({
    where: {
      provider_providerAccountId: {
        provider: "github",
        providerAccountId: String(githubUser.id),
      },
    },
    update: {
      access_token,
      userId: session.user.id,
    },
    create: {
      userId: session.user.id,
      type: "oauth",
      provider: "github",
      providerAccountId: String(githubUser.id),
      access_token,
      token_type: "bearer",
      scope: "read:user",
    },
  })

  // Sync GitHub user stats (repos, stars, followers, languages)
  // Do this at connect time so profile + dashboard have data immediately
  try {
    const [profile, repos] = await Promise.all([
      fetchGitHubUserProfile(access_token),
      fetchUserRepos(access_token),
    ])

    const publicRepos = repos.filter((r) => !r.private)
    const totalStars = publicRepos.reduce((sum, r) => sum + r.stargazers_count, 0)

    const langCounts: Record<string, number> = {}
    for (const repo of publicRepos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
      }
    }
    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubUsername: profile.login,
        githubProfileUrl: profile.html_url,
        githubBio: profile.bio,
        githubReposCount: publicRepos.length,
        githubTotalStars: totalStars,
        githubFollowers: profile.followers,
        githubTopLanguages: topLanguages,
        githubSyncedAt: new Date(),
      },
    })
  } catch {
    // Stats sync failed -- still save basic info so the link isn't lost
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubUsername: githubUser.login,
        githubProfileUrl: githubUser.html_url,
      },
    })
  }

  // Clear the OAuth state cookie
  const response = NextResponse.redirect(
    new URL(`${returnTo}?github=connected`, origin)
  )

  response.cookies.set("github_oauth_state", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })

  return response
}
