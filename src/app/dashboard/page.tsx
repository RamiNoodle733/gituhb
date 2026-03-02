import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Github, ArrowRight } from "lucide-react"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const [projectCount, applicationCount, user, githubAccount] = await Promise.all([
    prisma.project.count({ where: { ownerId: session.user.id } }),
    prisma.application.count({ where: { userId: session.user.id } }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    }),
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { id: true },
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
      <div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ""}!
          {" "}{projectCount} project{projectCount !== 1 ? "s" : ""} &middot; {applicationCount} application{applicationCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Post a Repo CTA */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-3">
            <Github className="size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-heading font-semibold">Post a project from your repos</p>
              <p className="text-sm text-muted-foreground">
                {githubAccount
                  ? "Select a repo and find collaborators in seconds."
                  : "Connect GitHub to post repos for collaboration."}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href={githubAccount ? "/dashboard/repos" : "/api/github/connect?returnTo=/dashboard"}>
              {githubAccount ? "Browse Repos" : "Connect GitHub"}
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

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
              <Link href="/dashboard/repos" className="text-primary hover:underline">
                Post one from your repos
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
