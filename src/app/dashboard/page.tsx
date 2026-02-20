import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FolderGit2, FileText, ShieldCheck, Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const [projectCount, applicationCount, user] = await Promise.all([
    prisma.project.count({ where: { ownerId: session.user.id } }),
    prisma.application.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { uhEmailVerified: true, name: true },
    }),
  ])

  const recentProjects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { id: true, title: true, slug: true, status: true, createdAt: true },
  })

  const recentApplications = await prisma.application.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      project: { select: { title: true, slug: true } },
      role: { select: { title: true } },
    },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back{user?.name ? `, ${user.name}` : ""}!
          </p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="mr-2 size-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Projects
            </CardTitle>
            <FolderGit2 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{projectCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Applications
            </CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{applicationCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              UH Verified
            </CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              variant="outline"
              className={
                user?.uhEmailVerified
                  ? "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300"
              }
            >
              {user?.uhEmailVerified ? "Verified" : "Not Verified"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Recent Projects</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/projects">View all</Link>
          </Button>
        </div>
        {recentProjects.length > 0 ? (
          <div className="space-y-2">
            {recentProjects.map((project) => (
              <Card key={project.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="font-medium hover:underline"
                    >
                      {project.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(project.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {project.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No projects yet.{" "}
              <Link href="/projects/new" className="text-primary hover:underline">
                Create one
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Applications */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-lg font-semibold">Recent Applications</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/applications">View all</Link>
          </Button>
        </div>
        {recentApplications.length > 0 ? (
          <div className="space-y-2">
            {recentApplications.map((app) => (
              <Card key={app.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <Link
                      href={`/projects/${app.project.slug}`}
                      className="font-medium hover:underline"
                    >
                      {app.project.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Applied as {app.role.title} &middot; {formatDate(app.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {app.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-sm text-muted-foreground">
              No applications yet.{" "}
              <Link href="/projects" className="text-primary hover:underline">
                Browse projects
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
