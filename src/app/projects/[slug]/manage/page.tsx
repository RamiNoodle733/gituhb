import Link from "next/link"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/auth"
import { getProjectBySlug } from "@/lib/queries/projects"
import { ApplicationCard } from "@/components/applications/application-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Inbox } from "lucide-react"

export default async function ManageApplicationsPage({
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

  // Only the owner can manage applications
  if (session.user.id !== project.ownerId) {
    redirect(`/projects/${project.slug}`)
  }

  const pendingApplications =
    project.applications?.filter((app) => app.status === "PENDING") ?? []
  const acceptedApplications =
    project.applications?.filter((app) => app.status === "ACCEPTED") ?? []
  const rejectedApplications =
    project.applications?.filter((app) => app.status === "REJECTED") ?? []

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link href={`/projects/${project.slug}`}>
          <ArrowLeft />
          Back to {project.title}
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Manage Applications
        </h1>
        <p className="mt-1 text-muted-foreground">{project.title}</p>
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingApplications.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedApplications.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedApplications.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {pendingApplications.length > 0 ? (
            <div className="space-y-4">
              {pendingApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  projectId={project.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState status="pending" />
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {acceptedApplications.length > 0 ? (
            <div className="space-y-4">
              {acceptedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  projectId={project.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState status="accepted" />
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedApplications.length > 0 ? (
            <div className="space-y-4">
              {rejectedApplications.map((application) => (
                <ApplicationCard
                  key={application.id}
                  application={application}
                  projectId={project.id}
                />
              ))}
            </div>
          ) : (
            <EmptyState status="rejected" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function EmptyState({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
      <Inbox className="mb-3 size-10 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        No {status} applications
      </p>
    </div>
  )
}
