"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { TIME_COMMITMENT_LABELS, LANGUAGE_TO_TECH } from "@/lib/constants"
import { quickCreateProject } from "@/lib/actions/project"
import type { RepoData } from "@/components/repos/repo-card"

interface QuickPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  repo: RepoData
}

interface RoleInput {
  title: string
  description: string
  count: number
}

export function QuickPostDialog({ open, onOpenChange, repo }: QuickPostDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [timeCommitment, setTimeCommitment] = useState("FIVE_TO_TEN")
  const [roles, setRoles] = useState<RoleInput[]>([
    { title: "Contributor", description: "Help build and improve the project", count: 1 },
  ])

  // Auto-derived preview data
  const title = repo.name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())

  const techStack = repo.language && LANGUAGE_TO_TECH[repo.language]
    ? [LANGUAGE_TO_TECH[repo.language]]
    : []

  function addRole() {
    setRoles([...roles, { title: "", description: "", count: 1 }])
  }

  function removeRole(index: number) {
    if (roles.length <= 1) return
    setRoles(roles.filter((_, i) => i !== index))
  }

  function updateRole(index: number, field: keyof RoleInput, value: string | number) {
    setRoles(
      roles.map((role, i) =>
        i === index ? { ...role, [field]: value } : role
      )
    )
  }

  function handleSubmit() {
    // Validate roles
    const hasEmptyRole = roles.some((r) => !r.title.trim())
    if (hasEmptyRole) {
      toast.error("All roles need a title.")
      return
    }

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
          timeCommitment,
          roles: roles.map((r) => ({
            title: r.title,
            description: r.description,
            count: r.count,
          })),
        })

        if (result?.error) {
          toast.error(result.error)
          return
        }

        toast.success("Project posted for collaboration!")
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Post for Collaboration</DialogTitle>
          <DialogDescription>
            Quickly create a project listing from this repository. You can
            edit the full details later.
          </DialogDescription>
        </DialogHeader>

        {/* Preview section */}
        <div className="space-y-4">
          {/* Auto-filled info (read-only preview) */}
          <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Title</Label>
              <p className="text-sm font-medium">{title}</p>
            </div>
            {repo.description && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Description
                </Label>
                <p className="text-sm">{repo.description}</p>
              </div>
            )}
            {techStack.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">
                  Tech Stack
                </Label>
                <div className="flex gap-1 mt-1">
                  {techStack.map((t) => (
                    <Badge key={t} variant="secondary" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {repo.topics.length > 0 && (
              <div>
                <Label className="text-xs text-muted-foreground">Topics</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {repo.topics.map((t) => (
                    <Badge key={t} variant="outline" className="text-xs">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Time Commitment */}
          <div className="space-y-2">
            <Label>Time Commitment</Label>
            <Select value={timeCommitment} onValueChange={setTimeCommitment}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TIME_COMMITMENT_LABELS).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Roles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Roles Needed</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRole}
              >
                <Plus className="size-3" />
                Add Role
              </Button>
            </div>
            {roles.map((role, index) => (
              <div
                key={index}
                className="flex items-start gap-2 rounded-lg border p-3"
              >
                <div className="grid flex-1 gap-2 sm:grid-cols-[1fr_1fr_60px]">
                  <Input
                    placeholder="Role title"
                    value={role.title}
                    onChange={(e) =>
                      updateRole(index, "title", e.target.value)
                    }
                  />
                  <Input
                    placeholder="What they'll do"
                    value={role.description}
                    onChange={(e) =>
                      updateRole(index, "description", e.target.value)
                    }
                  />
                  <Input
                    type="number"
                    min={1}
                    value={role.count}
                    onChange={(e) =>
                      updateRole(
                        index,
                        "count",
                        parseInt(e.target.value, 10) || 1
                      )
                    }
                  />
                </div>
                {roles.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-0.5 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeRole(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
            Publish
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
