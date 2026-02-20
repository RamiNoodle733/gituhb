import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProjectForm } from "@/components/projects/project-form"

export default async function NewProjectPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Create a New Project
        </h1>
        <p className="mt-1 text-muted-foreground">
          Describe your project and the roles you need filled to find the right
          collaborators.
        </p>
      </div>
      <ProjectForm mode="create" />
    </div>
  )
}
