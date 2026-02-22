"use client"

import { useState, useEffect } from "react"
import { Search, Star, GitFork, Loader2, Github } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface Repo {
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
}

interface RepoPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (repo: Repo) => void
}

export function RepoPickerDialog({
  open,
  onOpenChange,
  onSelect,
}: RepoPickerDialogProps) {
  const [repos, setRepos] = useState<Repo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (open && repos.length === 0) {
      setLoading(true)
      setError(null)
      fetch("/api/github/repos")
        .then((res) => {
          if (!res.ok) throw new Error("Failed to fetch repos")
          return res.json()
        })
        .then((data) => setRepos(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }
  }, [open, repos.length])

  const filtered = repos.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Select a Repository</DialogTitle>
          <DialogDescription>
            Choose a repository to link to your project.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories..."
            className="pl-9"
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto -mx-2 px-2">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="py-8 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {search ? "No matching repositories." : "No public repositories found."}
            </p>
          )}

          {!loading &&
            !error &&
            filtered.map((repo) => (
              <button
                key={repo.id}
                type="button"
                className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent mb-2"
                onClick={() => {
                  onSelect(repo)
                  onOpenChange(false)
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Github className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate font-mono text-sm font-medium">
                        {repo.full_name}
                      </span>
                    </div>
                    {repo.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {repo.language && (
                        <Badge variant="outline" className="text-xs">
                          {repo.language}
                        </Badge>
                      )}
                      {repo.stargazers_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Star className="size-3" />
                          {repo.stargazers_count}
                        </span>
                      )}
                      {repo.forks_count > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <GitFork className="size-3" />
                          {repo.forks_count}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    tabIndex={-1}
                  >
                    Select
                  </Button>
                </div>
              </button>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
