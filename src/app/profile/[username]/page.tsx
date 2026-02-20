import Link from "next/link"
import { notFound } from "next/navigation"
import { getProfile } from "@/lib/queries/profiles"
import { formatDate, getInitials } from "@/lib/utils"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { ProjectCard } from "@/components/projects/project-card"
import { Github, ShieldCheck, Calendar, GraduationCap } from "lucide-react"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const user = await getProfile(username)

  if (!user) {
    notFound()
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-col gap-8 md:flex-row">
        {/* Profile sidebar */}
        <div className="w-full shrink-0 space-y-4 md:w-64">
          <Avatar className="mx-auto size-32 md:mx-0">
            {user.image && (
              <AvatarImage src={user.image} alt={user.name ?? username} />
            )}
            <AvatarFallback className="text-2xl">
              {getInitials(user.name ?? username)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center md:text-left">
            {user.name && (
              <h1 className="font-heading text-2xl font-bold">{user.name}</h1>
            )}
            <p className="text-muted-foreground">@{user.username}</p>
          </div>

          {user.bio && (
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {user.uhEmailVerified && (
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                <ShieldCheck className="mr-1 size-3" />
                UH Verified
              </Badge>
            )}
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            {user.githubUsername && (
              <a
                href={user.githubProfileUrl ?? `https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Github className="size-4" />
                {user.githubUsername}
              </a>
            )}
            {user.major && (
              <div className="flex items-center gap-2">
                <GraduationCap className="size-4" />
                {user.major}
                {user.graduationYear && ` '${user.graduationYear.toString().slice(-2)}`}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              Joined {formatDate(user.createdAt)}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-6">
          {/* Skills */}
          {user.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {user.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="font-mono text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          <div>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Projects ({user.ownedProjects.length})
            </h2>
            {user.ownedProjects.length > 0 ? (
              <div className="grid gap-4">
                {user.ownedProjects.map((project) => (
                  <ProjectCard key={project.id} project={{
                    ...project,
                    owner: { name: user.name, image: user.image, username: user.username },
                  }} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-sm text-muted-foreground">
                  No public projects yet.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
