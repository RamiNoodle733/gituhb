import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { fetchUserRepos, getGitHubToken } from "@/lib/github"

export async function GET() {
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

  try {
    const repos = await fetchUserRepos(token)
    const publicRepos = repos
      .filter((r) => !r.private)
      .map((r) => ({
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
      }))
    return NextResponse.json(publicRepos)
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch repos" },
      { status: 500 }
    )
  }
}
