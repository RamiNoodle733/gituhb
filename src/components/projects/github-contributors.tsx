import { fetchRepoContributors, type GitHubContributor } from "@/lib/github"

interface GitHubContributorsProps {
  owner: string
  repo: string
  token?: string | null
}

export async function GitHubContributors({ owner, repo, token }: GitHubContributorsProps) {
  let contributors: GitHubContributor[] = []
  try {
    contributors = await fetchRepoContributors(owner, repo, token)
  } catch {
    return null
  }

  if (contributors.length === 0) return null

  return (
    <section>
      <h2 className="font-heading mb-4 text-xl font-semibold">Contributors</h2>
      <div className="flex flex-wrap gap-3">
        {contributors.map((contributor) => (
          <a
            key={contributor.login}
            href={contributor.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-accent"
          >
            <img
              src={contributor.avatar_url}
              alt={contributor.login}
              className="size-8 rounded-full"
            />
            <div>
              <p className="text-sm font-medium">{contributor.login}</p>
              <p className="text-xs text-muted-foreground">
                {contributor.contributions} commits
              </p>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
