import { prisma } from "@/lib/prisma"

const GITHUB_API = "https://api.github.com"

export class GitHubError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "GitHubError"
  }
}

export async function getGitHubToken(userId: string): Promise<string | null> {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "github" },
    select: { access_token: true },
  })
  return account?.access_token ?? null
}

export function parseGitHubRepoUrl(url: string): { owner: string; repo: string } | null {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/|$)/)
  if (!match) return null
  return { owner: match[1], repo: match[2] }
}

async function githubFetch<T>(
  path: string,
  token?: string | null,
  options?: { accept?: string }
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: options?.accept ?? "application/vnd.github.v3+json",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${GITHUB_API}${path}`, {
    headers,
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    throw new GitHubError(
      `GitHub API error: ${res.status} ${res.statusText}`,
      res.status
    )
  }

  return res.json() as Promise<T>
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  open_issues_count: number
  topics: string[]
  pushed_at: string
  created_at: string
  updated_at: string
  private: boolean
}

export interface GitHubUser {
  login: string
  html_url: string
  avatar_url: string
}

export interface GitHubContributor {
  login: string
  avatar_url: string
  html_url: string
  contributions: number
}

export interface GitHubIssue {
  number: number
  title: string
  html_url: string
  state: string
  created_at: string
  user: { login: string; avatar_url: string } | null
  labels: { name: string; color: string }[]
}

export interface GitHubCommit {
  sha: string
  html_url: string
  commit: {
    message: string
    author: { name: string; date: string } | null
  }
  author: { login: string; avatar_url: string } | null
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
  return githubFetch<GitHubRepo[]>(
    "/user/repos?type=public&sort=updated&per_page=100",
    token
  )
}

export async function fetchRepoDetails(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubRepo> {
  return githubFetch<GitHubRepo>(`/repos/${owner}/${repo}`, token)
}

export async function fetchRepoLanguages(
  owner: string,
  repo: string,
  token?: string | null
): Promise<Record<string, number>> {
  return githubFetch<Record<string, number>>(
    `/repos/${owner}/${repo}/languages`,
    token
  )
}

export async function fetchRepoReadme(
  owner: string,
  repo: string,
  token?: string | null
): Promise<string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3.html",
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
    headers,
    next: { revalidate: 0 },
  })

  if (!res.ok) {
    if (res.status === 404) return ""
    throw new GitHubError(`GitHub API error: ${res.status}`, res.status)
  }

  return res.text()
}

export async function fetchRepoContributors(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubContributor[]> {
  return githubFetch<GitHubContributor[]>(
    `/repos/${owner}/${repo}/contributors?per_page=20`,
    token
  )
}

export async function fetchRepoIssues(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubIssue[]> {
  return githubFetch<GitHubIssue[]>(
    `/repos/${owner}/${repo}/issues?state=open&per_page=10&sort=created&direction=desc`,
    token
  )
}

export async function fetchRepoCommits(
  owner: string,
  repo: string,
  token?: string | null
): Promise<GitHubCommit[]> {
  return githubFetch<GitHubCommit[]>(
    `/repos/${owner}/${repo}/commits?per_page=10`,
    token
  )
}

export async function syncProjectGitHubData(
  projectId: string,
  owner: string,
  repo: string,
  token?: string | null
) {
  const [details, languages] = await Promise.all([
    fetchRepoDetails(owner, repo, token),
    fetchRepoLanguages(owner, repo, token),
  ])

  await prisma.project.update({
    where: { id: projectId },
    data: {
      githubRepoOwner: owner,
      githubRepoName: repo,
      githubRepoId: details.id,
      githubDescription: details.description,
      githubStars: details.stargazers_count,
      githubForks: details.forks_count,
      githubOpenIssues: details.open_issues_count,
      githubLanguage: details.language,
      githubLanguages: languages,
      githubLastCommitAt: details.pushed_at ? new Date(details.pushed_at) : null,
      githubSyncedAt: new Date(),
    },
  })
}
