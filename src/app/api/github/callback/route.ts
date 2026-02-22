import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const stateParam = searchParams.get("state")

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
      new URL(`${returnTo}?error=invalid_state`, process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  // Verify we have a code
  if (!code) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=missing_code`, process.env.NEXT_PUBLIC_APP_URL!)
    )
  }

  // Get the current session
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=unauthorized`, process.env.NEXT_PUBLIC_APP_URL!)
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
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code,
      }),
    }
  )

  const tokenData = await tokenResponse.json()

  if (tokenData.error || !tokenData.access_token) {
    return NextResponse.redirect(
      new URL(`${returnTo}?error=token_exchange_failed`, process.env.NEXT_PUBLIC_APP_URL!)
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
      new URL(`${returnTo}?error=github_fetch_failed`, process.env.NEXT_PUBLIC_APP_URL!)
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

  // Update the User record with GitHub info
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      githubUsername: githubUser.login,
      githubProfileUrl: githubUser.html_url,
    },
  })

  // Clear the OAuth state cookie
  const response = NextResponse.redirect(
    new URL(`${returnTo}?github=connected`, process.env.NEXT_PUBLIC_APP_URL!)
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
