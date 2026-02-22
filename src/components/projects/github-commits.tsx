import { fetchRepoCommits, type GitHubCommit } from "@/lib/github"
import { GitCommit, ExternalLink } from "lucide-react"

interface GitHubCommitsProps {
  owner: string
  repo: string
  token?: string | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })
}

export async function GitHubCommits({ owner, repo, token }: GitHubCommitsProps) {
  let commits: GitHubCommit[] = []
  try {
    commits = await fetchRepoCommits(owner, repo, token)
  } catch {
    return null
  }

  if (commits.length === 0) return null

  return (
    <section>
      <h2 className="font-heading mb-4 text-xl font-semibold">Recent Activity</h2>
      <div className="space-y-1">
        {commits.map((commit) => {
          const message = commit.commit.message.split("\n")[0]
          const date = commit.commit.author?.date
          return (
            <a
              key={commit.sha}
              href={commit.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <GitCommit className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{message}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">{commit.sha.slice(0, 7)}</span>
                  {commit.author && <span>{commit.author.login}</span>}
                  {date && <span>{formatDate(date)}</span>}
                  <ExternalLink className="size-3" />
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
