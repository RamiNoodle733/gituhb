import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { getProjectBySlug } from "@/lib/queries/projects"
import { ProjectForm } from "@/components/projects/project-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  // Only the owner can edit the project
  if (session.user.id !== project.ownerId) {
    redirect(`/projects/${project.slug}`)
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/projects/${project.slug}`}>
          <ArrowLeft />
          Back to {project.title}
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Edit Project
        </h1>
        <p className="mt-1 text-muted-foreground">
          Update your project details and open roles.
        </p>
      </div>

      <ProjectForm
        mode="edit"
        projectId={project.id}
        initialData={{
          title: project.title,
          description: project.description,
          longDescription: project.longDescription ?? undefined,
          githubRepoUrl: project.githubRepoUrl ?? undefined,
          timeCommitment: project.timeCommitment,
          techStack: project.techStack,
          tags: project.tags,
          maxMembers: project.maxMembers ?? undefined,
          roles: project.roles.map((r) => ({
            title: r.title,
            description: r.description ?? undefined,
            count: r.count,
          })),
          status: project.status,
        }}
      />
    </div>
  )
}
