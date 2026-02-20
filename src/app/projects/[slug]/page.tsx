import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getProjectBySlug } from "@/lib/queries/projects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  ExternalLink,
  Clock,
  Users,
  Calendar,
  Pencil,
  Settings,
  Github,
  CheckCircle2,
} from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { TIME_COMMITMENT_LABELS } from "@/lib/constants"

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-uh-teal/10 text-uh-teal border-uh-teal/20",
  PAUSED: "bg-uh-gold/10 text-uh-gold border-uh-gold/20",
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const session = await auth()

  const project = await getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const isOwner = session?.user?.id === project.ownerId

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            {project.title}
          </h1>
          <Badge
            variant="outline"
            className={
              STATUS_STYLES[project.status] ?? "border-border text-foreground"
            }
          >
            {project.status}
          </Badge>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.slug}/edit`}>
                <Pencil />
                Edit
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.slug}/manage`}>
                <Settings />
                Manage Applications
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Owner info */}
      <div className="mb-8 flex items-center gap-3">
        <Avatar size="sm">
          <AvatarImage src={project.owner.image ?? undefined} />
          <AvatarFallback>
            {getInitials(project.owner.name ?? "U")}
          </AvatarFallback>
        </Avatar>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link
            href={`/profile/${project.owner.username}`}
            className="font-medium text-foreground hover:underline"
          >
            {project.owner.name ?? project.owner.username}
          </Link>
          <span>posted on {formatDate(project.createdAt)}</span>
        </div>
      </div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left column - content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Description */}
          <section>
            <h2 className="font-heading mb-3 text-xl font-semibold">
              About this Project
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>

          {/* Long description */}
          {project.longDescription && (
            <section>
              <h2 className="font-heading mb-3 text-xl font-semibold">
                Details
              </h2>
              <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                {project.longDescription}
              </div>
            </section>
          )}

          {/* GitHub repo link */}
          {project.githubRepoUrl && (
            <div>
              <Button variant="outline" asChild>
                <a
                  href={project.githubRepoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github />
                  View Repository
                  <ExternalLink className="size-3" />
                </a>
              </Button>
            </div>
          )}

          <Separator />

          {/* Roles section */}
          <section>
            <h2 className="font-heading mb-4 text-xl font-semibold">
              Open Roles
            </h2>
            <div className="space-y-3">
              {project.roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-heading text-base">
                        {role.title}
                      </CardTitle>
                      {role.filled ? (
                        <Badge
                          variant="secondary"
                          className="gap-1"
                        >
                          <CheckCircle2 className="size-3" />
                          Filled
                        </Badge>
                      ) : (
                        !isOwner &&
                        session?.user && (
                          <Button size="sm" asChild>
                            <Link
                              href={`/projects/${project.slug}/apply?role=${role.id}`}
                            >
                              Apply
                            </Link>
                          </Button>
                        )
                      )}
                    </div>
                  </CardHeader>
                  {role.description && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </CardContent>
                  )}
                </Card>
              ))}
              {project.roles.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No roles have been listed for this project yet.
                </p>
              )}
            </div>
          </section>

          <Separator />

          {/* Team section */}
          <section>
            <h2 className="font-heading mb-4 text-xl font-semibold">Team</h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {project.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <Avatar size="sm">
                    <AvatarImage src={member.user.image ?? undefined} />
                    <AvatarFallback>
                      {getInitials(member.user.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {member.user.name ?? member.user.username}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {member.projectRole?.title ?? member.role}
                    </p>
                  </div>
                </div>
              ))}
              {project.members.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No team members yet.
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Right column - sidebar */}
        <div className="space-y-6">
          {/* Time commitment */}
          <Card>
            <CardContent className="space-y-4 pt-0">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">Time Commitment</span>
              </div>
              <Badge variant="secondary">
                {TIME_COMMITMENT_LABELS[project.timeCommitment] ??
                  project.timeCommitment}
              </Badge>
            </CardContent>
          </Card>

          {/* Tech stack */}
          {project.techStack.length > 0 && (
            <Card>
              <CardContent className="space-y-3 pt-0">
                <span className="text-sm font-medium">Tech Stack</span>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech) => (
                    <Badge
                      key={tech}
                      variant="outline"
                      className="font-mono text-xs"
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {project.tags.length > 0 && (
            <Card>
              <CardContent className="space-y-3 pt-0">
                <span className="text-sm font-medium">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Stats */}
          <Card>
            <CardContent className="space-y-3 pt-0">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  {project.members.length}{" "}
                  {project.members.length === 1 ? "member" : "members"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <span className="text-sm">
                  Created {formatDate(project.createdAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
