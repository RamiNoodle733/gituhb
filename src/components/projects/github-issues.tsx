import { fetchRepoIssues, type GitHubIssue } from "@/lib/github"
import { Badge } from "@/components/ui/badge"
import { ExternalLink } from "lucide-react"

interface GitHubIssuesProps {
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

export async function GitHubIssues({ owner, repo, token }: GitHubIssuesProps) {
  let issues: GitHubIssue[] = []
  try {
    issues = await fetchRepoIssues(owner, repo, token)
  } catch {
    return null
  }

  if (issues.length === 0) return null

  return (
    <section>
      <h2 className="font-heading mb-4 text-xl font-semibold">Open Issues</h2>
      <div className="space-y-2">
        {issues.map((issue) => (
          <a
            key={issue.number}
            href={issue.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-accent"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">{issue.title}</span>
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  #{issue.number} opened {formatDate(issue.created_at)}
                  {issue.user && ` by ${issue.user.login}`}
                </span>
                {issue.labels.map((label) => (
                  <Badge
                    key={label.name}
                    variant="outline"
                    className="text-[10px] px-1.5 py-0"
                    style={{
                      borderColor: `#${label.color}`,
                      color: `#${label.color}`,
                    }}
                  >
                    {label.name}
                  </Badge>
                ))}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
