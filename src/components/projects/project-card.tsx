import Link from "next/link"
import { Clock, Users } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"
import { TIME_COMMITMENT_LABELS } from "@/lib/constants"

type ProjectCardProps = {
  project: {
    id: string
    title: string
    slug: string
    description: string
    techStack: string[]
    timeCommitment: string
    status: string
    createdAt: Date
    owner: {
      name: string | null
      image: string | null
      username: string | null
    }
    roles: {
      id: string
      title: string
      filled: boolean
    }[]
    _count: {
      members: number
    }
  }
}

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
  PAUSED:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
  COMPLETED: "",
  ARCHIVED: "bg-muted text-muted-foreground",
}

export function ProjectCard({ project }: ProjectCardProps) {
  const openRoles = project.roles.filter((r) => !r.filled).length
  const displayedTech = project.techStack.slice(0, 4)
  const remainingTech = project.techStack.length - displayedTech.length

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="font-heading font-semibold">
            <Link
              href={`/projects/${project.slug}`}
              className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              {project.title}
            </Link>
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("shrink-0 text-xs", statusStyles[project.status])}
          >
            {project.status.charAt(0) + project.status.slice(1).toLowerCase()}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {displayedTech.map((tech) => (
            <Badge
              key={tech}
              variant="secondary"
              className="font-mono text-xs"
            >
              {tech}
            </Badge>
          ))}
          {remainingTech > 0 && (
            <Badge variant="secondary" className="font-mono text-xs">
              +{remainingTech} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Avatar size="sm">
            {project.owner.image && (
              <AvatarImage
                src={project.owner.image}
                alt={project.owner.name ?? "Owner"}
              />
            )}
            <AvatarFallback>
              {getInitials(project.owner.name ?? "?")}
            </AvatarFallback>
          </Avatar>
          <span className="truncate text-xs">
            {project.owner.name ?? project.owner.username}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs">
            <Clock className="size-3.5" />
            {TIME_COMMITMENT_LABELS[project.timeCommitment] ??
              project.timeCommitment}
          </span>
          {openRoles > 0 && (
            <span className="flex items-center gap-1 text-xs font-medium text-foreground">
              <Users className="size-3.5" />
              {openRoles}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
