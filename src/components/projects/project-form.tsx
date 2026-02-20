"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Trash2, Loader2 } from "lucide-react"
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
import { TECH_STACK_OPTIONS, TAG_OPTIONS, TIME_COMMITMENT_LABELS } from "@/lib/constants"
import { ProjectStatus } from "@/generated/prisma"

interface ProjectFormProps {
  mode: "create" | "edit"
  initialData?: CreateProjectInput
  projectId?: string
}

export function ProjectForm({ mode, initialData, projectId }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

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
      roles: initialData?.roles ?? [{ title: "", description: "", count: 1 }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "roles",
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
              <FormLabel>Short Description</FormLabel>
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

        {/* Long Description */}
        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Detailed Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Provide more details about your project, goals, and what you're building..."
                  className="min-h-32"
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

        {/* Tags */}
        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <TagInput
                  value={field.value}
                  onChange={field.onChange}
                  options={TAG_OPTIONS}
                  placeholder="Add tags..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Max Members */}
        <FormField
          control={form.control}
          name="maxMembers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Max Members{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 5"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value ? parseInt(e.target.value, 10) : undefined
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Roles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FormLabel className="text-base">Roles</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ title: "", description: "", count: 1 })}
            >
              <Plus className="size-4" />
              Add Role
            </Button>
          </div>
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start gap-3 rounded-lg border p-4"
            >
              <div className="grid flex-1 gap-3 sm:grid-cols-[1fr_1fr_80px]">
                <FormField
                  control={form.control}
                  name={`roles.${index}.title`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Frontend Dev" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`roles.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="What they'll do"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={`roles.${index}.count`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Count</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                >
                  <Trash2 className="size-4" />
                  <span className="sr-only">Remove role</span>
                </Button>
              )}
            </div>
          ))}
        </div>

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
