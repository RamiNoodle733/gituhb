"use client"

import { useState, useTransition } from "react"
import { Star, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { toast } from "sonner"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { featureRepo, unfeatureRepo } from "@/lib/actions/github"
import { QuickPostDialog } from "@/components/repos/quick-post-dialog"
import { getLanguageColor } from "@/lib/language-colors"

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
                className="hover:underline"
              >
                {repo.name}
              </a>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              onClick={handleFeatureToggle}
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Star
                  className={`size-3.5 ${isFeatured ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`}
                />
              )}
            </Button>
          </div>
          {repo.description && (
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {repo.description}
            </p>
          )}
        </CardHeader>

        <CardContent className="flex-1 space-y-2 pb-2">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {repo.language && (
              <span className="flex items-center gap-1">
                <span
                  className="inline-block size-3 rounded-full"
                  style={{ backgroundColor: getLanguageColor(repo.language) }}
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
          </div>

          {relativeTime && (
            <p className="text-xs text-muted-foreground">
              Updated {relativeTime}
            </p>
          )}
        </CardContent>

        <CardFooter className="pt-0">
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
