"use client"

import { useState, useTransition } from "react"
import { Star, GitFork, ExternalLink, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { featureRepo, unfeatureRepo } from "@/lib/actions/github"
import { QuickPostDialog } from "@/components/repos/quick-post-dialog"

export interface RepoData {
  id: number
  name: string
  full_name: string
  html_url: string
  description: string | null
  language: string | null
  stargazers_count: number
  forks_count: number
  topics: string[]
  updated_at: string
  pushed_at: string
  linkedProjectSlug?: string | null
  isFeatured?: boolean
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dart: "#00B4AB",
}

interface RepoCardProps {
  repo: RepoData
  initialFeatured: boolean
}

export function RepoCard({ repo, initialFeatured }: RepoCardProps) {
  const [isFeatured, setIsFeatured] = useState(initialFeatured)
  const [isPending, startTransition] = useTransition()
  const [quickPostOpen, setQuickPostOpen] = useState(false)

  const relativeTime = repo.pushed_at
    ? formatDistanceToNow(new Date(repo.pushed_at), { addSuffix: true })
    : repo.updated_at
      ? formatDistanceToNow(new Date(repo.updated_at), { addSuffix: true })
      : null

  function handleFeatureToggle() {
    startTransition(async () => {
      if (isFeatured) {
        const result = await unfeatureRepo(repo.id)
        if (result.error) {
          toast.error(result.error)
          return
        }
        setIsFeatured(false)
        toast.success("Repo unfeatured")
      } else {
        const result = await featureRepo({
          githubRepoId: repo.id,
          name: repo.name,
          fullName: repo.full_name,
          htmlUrl: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          topics: repo.topics,
        })
        if (result.error) {
          toast.error(result.error)
          return
        }
        setIsFeatured(true)
        toast.success("Repo featured on your profile")
      }
    })
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-sm">
              <a
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono hover:underline"
              >
                {repo.name}
                <ExternalLink className="size-3 shrink-0 text-muted-foreground" />
              </a>
            </CardTitle>
          </div>
          {repo.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {repo.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 space-y-3 pb-2">
          {/* Language + stats row */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-3 rounded-full"
                  style={{
                    backgroundColor:
                      LANGUAGE_COLORS[repo.language] ?? "#8b8b8b",
                  }}
                />
                {repo.language}
              </span>
            )}
            {repo.stargazers_count > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3" />
                {repo.stargazers_count}
              </span>
            )}
            {repo.forks_count > 0 && (
              <span className="flex items-center gap-1">
                <GitFork className="size-3" />
                {repo.forks_count}
              </span>
            )}
          </div>

          {/* Topics */}
          {repo.topics && repo.topics.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {repo.topics.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {topic}
                </Badge>
              ))}
              {repo.topics.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{repo.topics.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Updated time */}
          {relativeTime && (
            <p className="text-[10px] text-muted-foreground">
              Updated {relativeTime}
            </p>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 pt-0">
          {repo.linkedProjectSlug ? (
            <Badge variant="secondary" className="w-full justify-center">
              Posted
            </Badge>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setQuickPostOpen(true)}
            >
              Post for Collaboration
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={handleFeatureToggle}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 size-3 animate-spin" />
            ) : (
              <Star
                className={`mr-2 size-3 ${isFeatured ? "fill-yellow-400 text-yellow-400" : ""}`}
              />
            )}
            {isFeatured ? "Unfavorite" : "Feature on Profile"}
          </Button>
        </CardFooter>
      </Card>

      <QuickPostDialog
        open={quickPostOpen}
        onOpenChange={setQuickPostOpen}
        repo={repo}
      />
    </>
  )
}
