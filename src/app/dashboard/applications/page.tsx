import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getUserApplications } from "@/lib/queries/profiles"
import { formatDate } from "@/lib/utils"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Inbox } from "lucide-react"

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  ACCEPTED: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
  WITHDRAWN: "bg-muted text-muted-foreground",
}

export default async function DashboardApplicationsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const applications = await getUserApplications(session.user.id)

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold tracking-tight">
        My Applications
      </h1>

      {applications.length > 0 ? (
        <div className="space-y-3">
          {applications.map((app) => (
            <Card key={app.id}>
              <CardContent className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
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
                <Badge
                  variant="outline"
                  className={cn("shrink-0 text-xs", statusStyles[app.status])}
                >
                  {app.status.charAt(0) + app.status.slice(1).toLowerCase()}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12">
            <Inbox className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              You haven&apos;t submitted any applications yet.
            </p>
            <Link href="/projects" className="text-sm text-primary hover:underline">
              Browse projects to get started
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
