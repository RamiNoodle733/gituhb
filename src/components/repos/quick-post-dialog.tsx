"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { quickCreateProject } from "@/lib/actions/project"
import type { RepoData } from "@/components/repos/repo-card"

interface QuickPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repo: RepoData
}

export function QuickPostDialog({ open, onOpenChange, repo }: QuickPostDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const title = repo.name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())

  function handleSubmit() {
    startTransition(async () => {
      try {
        const result = await quickCreateProject({
          repoName: repo.name,
          repoFullName: repo.full_name,
          repoUrl: repo.html_url,
          repoDescription: repo.description,
          repoLanguage: repo.language,
          repoTopics: repo.topics,
          repoId: repo.id,
        })

        if (result?.error) {
          toast.error(result.error)
          return
        }

        toast.success("Project posted!")
        onOpenChange(false)

        if (result?.slug) {
          router.push(`/projects/${result.slug}`)
        } else {
          router.refresh()
        }
      } catch {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Post for Collaboration</DialogTitle>
          <DialogDescription>
            This repo will be listed as a project for UH students to join.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
          <p className="font-medium">{title}</p>
          {repo.description && (
            <p className="text-sm text-muted-foreground">{repo.description}</p>
          )}
          <div className="flex flex-wrap gap-1.5">
            {repo.language && (
              <Badge variant="secondary" className="text-xs">
                {repo.language}
              </Badge>
            )}
            {repo.topics.slice(0, 3).map((t) => (
              <Badge key={t} variant="outline" className="text-xs">
                {t}
              </Badge>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Confirm & Post
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
