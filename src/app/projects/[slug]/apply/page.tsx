import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { getProjectBySlug } from "@/lib/queries/projects"
import { ApplicationForm } from "@/components/applications/application-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, ArrowLeft, ShieldAlert } from "lucide-react"

export default async function ApplyToProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  // Cannot apply to own project
  if (session.user.id === project.ownerId) {
    redirect(`/projects/${project.slug}`)
  }

  // Must have verified UH email to apply
  if (!session.user.uhEmailVerified) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <ShieldAlert className="mb-4 size-12 text-muted-foreground" />
            <h2 className="font-heading text-xl font-semibold">
              UH Email Verification Required
            </h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              You need to verify your UH email before applying to projects. This
              helps ensure all collaborators are UH students.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" asChild>
                <Link href={`/projects/${project.slug}`}>
                  <ArrowLeft />
                  Back to Project
                </Link>
              </Button>
              <Button asChild>
                <Link href="/dashboard/settings">Verify Email</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const roleId = typeof sp.role === "string" ? sp.role : undefined

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/projects/${project.slug}`}>
          <ArrowLeft />
          Back to {project.title}
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Apply to {project.title}
        </h1>
        <p className="mt-1 text-muted-foreground">
          Tell the project owner why you would be a great fit for this team.
        </p>
      </div>

      <ApplicationForm
        projectId={project.id}
        roles={project.roles}
        defaultRoleId={roleId}
      />
    </div>
  )
}
