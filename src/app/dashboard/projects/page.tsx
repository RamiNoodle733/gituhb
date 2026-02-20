import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getUserProjects } from "@/lib/queries/projects"
import { formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Users, FileText } from "lucide-react"

export default async function DashboardProjectsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const projects = await getUserProjects(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold tracking-tight">My Projects</h1>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 size-4" />
            New Project
          </Link>
        </Button>
      </div>

      {projects.length > 0 ? (
        <div className="space-y-4">
          {projects.map((project) => {
            const openRoles = project.roles.filter((r) => !r.filled).length
            return (
              <Card key={project.id}>
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="font-heading font-semibold hover:underline"
                      >
                        {project.title}
                      </Link>
                      <Badge variant="outline" className="text-xs">
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="size-3" />
                        {project._count.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="size-3" />
                        {project._count.applications} applications
                      </span>
                      {openRoles > 0 && (
                        <span className="text-teal-600 dark:text-teal-400">
                          {openRoles} open {openRoles === 1 ? "role" : "roles"}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/projects/${project.slug}/manage`}>
                        <FileText className="mr-1 size-3" />
                        Applications
                      </Link>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/projects/${project.slug}/edit`}>
                        <Settings className="mr-1 size-3" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="mb-4 text-sm text-muted-foreground">
              You haven&apos;t created any projects yet.
            </p>
            <Button asChild>
              <Link href="/projects/new">
                <Plus className="mr-2 size-4" />
                Create Your First Project
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
