"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Github } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"
import { TagInput } from "@/components/ui/tag-input"
import {
  createProjectSchema,
  type CreateProjectInput,
} from "@/lib/validators/project"
import { createProject, updateProject } from "@/lib/actions/project"
import { TECH_STACK_OPTIONS, TIME_COMMITMENT_LABELS, LANGUAGE_TO_TECH } from "@/lib/constants"
import { ProjectStatus } from "@/generated/prisma/enums"
import { RepoPickerDialog } from "@/components/projects/repo-picker-dialog"

interface ProjectFormProps {
  mode: "create" | "edit"
  initialData?: CreateProjectInput
  projectId?: string
  githubConnected?: boolean
}

export function ProjectForm({ mode, initialData, projectId, githubConnected }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [repoPickerOpen, setRepoPickerOpen] = useState(false)

  const form = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      longDescription: initialData?.longDescription ?? "",
      githubRepoUrl: initialData?.githubRepoUrl ?? "",
      timeCommitment: initialData?.timeCommitment ?? "FIVE_TO_TEN",
      techStack: initialData?.techStack ?? [],
      tags: initialData?.tags ?? [],
      maxMembers: initialData?.maxMembers,
      roles: initialData?.roles ?? [{ title: "Collaborator", description: "", count: 3 }],
    },
  })

  function onSubmit(data: CreateProjectInput) {
    startTransition(async () => {
      try {
        if (mode === "edit" && projectId) {
          const result = await updateProject(projectId, data)
          if (result?.error) {
            toast.error(result.error)
            return
          }
          toast.success("Project updated successfully")
        } else {
          const result = await createProject(data)
          if (result?.error) {
            toast.error(result.error)
            return
          }
          toast.success("Project created successfully")
          if (result?.slug) {
            router.push(`/projects/${result.slug}`)
            return
          }
        }
        router.refresh()
      } catch {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  function handleRepoSelect(repo: {
    html_url: string
    description: string | null
    language: string | null
    topics: string[]
    name: string
  }) {
    form.setValue("githubRepoUrl", repo.html_url)

    if (!form.getValues("title")) {
      form.setValue("title", repo.name.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()))
    }

    if (!form.getValues("description") && repo.description) {
      form.setValue("description", repo.description)
    }

    const currentTech = form.getValues("techStack")
    if (repo.language && LANGUAGE_TO_TECH[repo.language]) {
      const tech = LANGUAGE_TO_TECH[repo.language]
      if (!currentTech.includes(tech)) {
        form.setValue("techStack", [...currentTech, tech])
      }
    }

    toast.success("Repository linked! Fields auto-filled.")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Import from GitHub */}
        {githubConnected && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setRepoPickerOpen(true)}
          >
            <Github className="mr-2 size-4" />
            Import from GitHub Repo
          </Button>
        )}

        <RepoPickerDialog
          open={repoPickerOpen}
          onOpenChange={setRepoPickerOpen}
          onSelect={handleRepoSelect}
        />

        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Title</FormLabel>
              <FormControl>
                <Input placeholder="My Awesome Project" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="A brief description of your project..."
                  className="min-h-20"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* GitHub Repo URL */}
        <FormField
          control={form.control}
          name="githubRepoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                GitHub Repository URL{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="https://github.com/username/repo"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Time Commitment */}
        <FormField
          control={form.control}
          name="timeCommitment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Time Commitment</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select time commitment" />
                  </SelectTrigger>
                </FormControl>
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
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Tech Stack */}
        <FormField
          control={form.control}
          name="techStack"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tech Stack</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  options={TECH_STACK_OPTIONS}
                  placeholder="Add technologies..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status (edit mode only) */}
        {mode === "edit" && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? initialData?.status ?? "ACTIVE"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.values(ProjectStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Submit */}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          {mode === "create" ? "Create Project" : "Save Changes"}
        </Button>
      </form>
    </Form>
  )
}
