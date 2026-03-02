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
    owner: {
      name: string | null
      image: string | null
      username: string | null
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
      </CardFooter>
    </Card>
  )
}
