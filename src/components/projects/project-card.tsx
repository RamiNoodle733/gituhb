import Link from "next/link"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Star, ArrowBigUp, Users } from "lucide-react"
import { getInitials } from "@/lib/utils"

type ProjectCardProps = {
  project: {
    id: string
    title: string
    slug: string
    description: string
    techStack: string[]
    status: string
    githubLanguage?: string | null
    githubStars?: number | null
    owner: {
      name: string | null
      image: string | null
      username: string | null
    }
    _count?: {
      members?: number
      votes?: number
    }
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="font-heading font-semibold">
          <Link
            href={`/projects/${project.slug}`}
            className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            {project.title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>
        {(project.githubLanguage || project.techStack.length > 0) && (
          <div className="flex flex-wrap gap-1.5">
            {project.githubLanguage && (
              <Badge variant="secondary" className="text-xs">
                {project.githubLanguage}
              </Badge>
            )}
            {project.techStack.slice(0, 2).map((tech) => (
              <Badge
                key={tech}
                variant="outline"
                className="font-mono text-xs"
              >
                {tech}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>

      <CardFooter className="text-sm text-muted-foreground">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="size-5">
              {project.owner.image && (
                <AvatarImage
                  src={project.owner.image}
                  alt={project.owner.name ?? "Owner"}
                />
              )}
              <AvatarFallback className="text-[10px]">
                {getInitials(project.owner.name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <span className="truncate text-xs">
              {project.owner.name ?? project.owner.username}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {project.githubStars != null && project.githubStars > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-3" />
                {project.githubStars}
              </span>
            )}
            {project._count?.votes != null && project._count.votes > 0 && (
              <span className="flex items-center gap-1">
                <ArrowBigUp className="size-3" />
                {project._count.votes}
              </span>
            )}
            {project._count?.members != null && project._count.members > 0 && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {project._count.members}
              </span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
