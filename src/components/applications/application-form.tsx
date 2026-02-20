"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
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
import {
  applicationSchema,
  type ApplicationInput,
} from "@/lib/validators/project"
import { applyToProject } from "@/lib/actions/application"

interface ApplicationFormProps {
  projectId: string
  roles: {
    id: string
    title: string
    description?: string | null
    count: number
    filled: boolean
  }[]
  defaultRoleId?: string
}

export function ApplicationForm({ projectId, roles, defaultRoleId }: ApplicationFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const unfilledRoles = roles.filter((role) => !role.filled)

  const form = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      roleId: defaultRoleId ?? "",
      message: "",
    },
  })

  if (unfilledRoles.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
        <AlertCircle className="size-4 shrink-0" />
        <p>All roles for this project are currently filled.</p>
      </div>
    )
  }

  function onSubmit(data: ApplicationInput) {
    startTransition(async () => {
      try {
        const result = await applyToProject(projectId, data)
        if (result?.error) {
          toast.error(result.error)
          return
        }
        toast.success("Application submitted successfully!")
        router.push(`/projects/${projectId}`)
        router.refresh()
      } catch {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Role Selection */}
        <FormField
          control={form.control}
          name="roleId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a role to apply for" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {unfilledRoles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      <div className="flex flex-col">
                        <span>{role.title}</span>
                        {role.description && (
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Message / Pitch */}
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Pitch</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell the project owner why you'd be a great fit for this role. Share relevant experience, skills, and your motivation... (min 20 characters)"
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit */}
        <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
          {isPending && <Loader2 className="size-4 animate-spin" />}
          Submit Application
        </Button>
      </form>
    </Form>
  )
}
