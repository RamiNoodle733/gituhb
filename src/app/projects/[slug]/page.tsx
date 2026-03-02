import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { getProjectBySlug } from "@/lib/queries/projects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { ExternalLink, Pencil, Settings, Github } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { JoinProjectButton } from "@/components/projects/join-project-button"

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
  const hasApplied = session?.user?.id
    ? project.applications.some((app) => app.userId === session.user!.id)
    : false
  const showJoin =
    !isOwner &&
    !!session?.user &&
    project.status === "ACTIVE"

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
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
                Manage
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

      {/* Description */}
      <section className="mb-8">
        <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
          {project.description}
        </p>
      </section>

      {/* Tech badges */}
      {project.techStack.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="outline" className="font-mono text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}

      {/* GitHub repo link */}
      {project.githubRepoUrl && (
        <div className="mb-8">
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

      {/* Join button */}
      {showJoin && (
        <div className="mb-8">
          <JoinProjectButton projectId={project.id} hasApplied={hasApplied} />
        </div>
      )}

      {/* Team */}
      {project.members.length > 0 && (
        <section>
          <h2 className="font-heading mb-4 text-xl font-semibold">Team</h2>
          <div className="grid gap-4 sm:grid-cols-2">
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
          </div>
        </section>
      )}
    </div>
  )
}
