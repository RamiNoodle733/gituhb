import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { fetchUserRepos, getGitHubToken } from "@/lib/github"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = await getGitHubToken(session.user.id)
  if (!token) {
    return NextResponse.json(
      { error: "GitHub not connected" },
      { status: 400 }
    )
  }

  const { searchParams } = new URL(request.url)
  const includeLinked = searchParams.get("includeLinked") === "true"

  try {
    const repos = await fetchUserRepos(token)
    const publicRepos = repos.filter((r) => !r.private)

    // If includeLinked, cross-reference repos with user's projects and featured repos
    let linkedProjectMap: Map<number, string> = new Map()
    let featuredRepoIds: Set<number> = new Set()

    if (includeLinked) {
      const [projects, featuredRepos] = await Promise.all([
        prisma.project.findMany({
          where: {
            ownerId: session.user.id,
            githubRepoId: { not: null },
          },
          select: {
            githubRepoId: true,
            slug: true,
          },
        }),
        prisma.featuredRepo.findMany({
          where: { userId: session.user.id },
          select: { githubRepoId: true },
        }),
      ])

      for (const p of projects) {
        if (p.githubRepoId) {
          linkedProjectMap.set(p.githubRepoId, p.slug)
        }
      }
      for (const f of featuredRepos) {
        featuredRepoIds.add(f.githubRepoId)
      }
    }

    const result = publicRepos.map((r) => ({
      id: r.id,
      name: r.name,
      full_name: r.full_name,
      html_url: r.html_url,
      description: r.description,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      topics: r.topics,
      updated_at: r.updated_at,
      pushed_at: r.pushed_at,
      ...(includeLinked
        ? {
            linkedProjectSlug: linkedProjectMap.get(r.id) ?? null,
            isFeatured: featuredRepoIds.has(r.id),
          }
        : {}),
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 500 }
    )
  }
}
