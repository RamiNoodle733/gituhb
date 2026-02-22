"use client"

import { Star, GitFork, CircleDot, Code2, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface GitHubStatsCardProps {
  stars: number | null
  forks: number | null
  openIssues: number | null
  language: string | null
  lastCommitAt: Date | null
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return "today"
  if (days === 1) return "yesterday"
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export function GitHubStatsCard({
  stars,
  forks,
  openIssues,
  language,
  lastCommitAt,
}: GitHubStatsCardProps) {
  return (
    <Card>
      <CardContent className="space-y-3 pt-0">
        <span className="text-sm font-medium">Repository Stats</span>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Star className="size-4 text-uh-gold" />
            <span className="text-sm">{stars ?? 0} stars</span>
          </div>
          <div className="flex items-center gap-2">
            <GitFork className="size-4 text-muted-foreground" />
            <span className="text-sm">{forks ?? 0} forks</span>
          </div>
          <div className="flex items-center gap-2">
            <CircleDot className="size-4 text-uh-green" />
            <span className="text-sm">{openIssues ?? 0} issues</span>
          </div>
          {language && (
            <div className="flex items-center gap-2">
              <Code2 className="size-4 text-muted-foreground" />
              <span className="text-sm">{language}</span>
            </div>
          )}
        </div>
        {lastCommitAt && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="size-3" />
            Last push {formatRelativeDate(new Date(lastCommitAt))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
