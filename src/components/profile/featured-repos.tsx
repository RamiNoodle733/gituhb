import Link from "next/link"
import { Star, GitFork, ExternalLink } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
  R: "#198CE7",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Zig: "#ec915c",
}

type FeaturedRepo = {
  id: string
  githubRepoId: number
  name: string
  fullName: string
  htmlUrl: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  topics: string[]
}

type FeaturedReposProps = {
  repos: FeaturedRepo[]
  isOwnProfile: boolean
}

export function FeaturedRepos({ repos, isOwnProfile }: FeaturedReposProps) {
  if (repos.length === 0) {
    if (isOwnProfile) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="mb-3 text-sm text-muted-foreground">
              Showcase your best repositories on your profile.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/repos">Feature Repositories</Link>
            </Button>
          </CardContent>
        </Card>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-heading text-lg">
          Featured Repositories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {repos.map((repo) => (
            <a
              key={repo.id}
              href={repo.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-mono text-sm font-medium text-primary group-hover:underline">
                  {repo.name}
                </h3>
                <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>

              {repo.description && (
                <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                  {repo.description}
                </p>
              )}

              <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                {repo.language && (
                  <span className="flex items-center gap-1">
                    <span
                      className="size-2 rounded-full"
                      style={{
                        backgroundColor:
                          LANGUAGE_COLORS[repo.language] ?? "#6e7681",
                      }}
                    />
                    {repo.language}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="size-3" />
                  {repo.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <GitFork className="size-3" />
                  {repo.forks.toLocaleString()}
                </span>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
