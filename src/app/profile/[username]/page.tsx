import Link from "next/link"
import { notFound } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { getProfile } from "@/lib/queries/profiles"
import { getInitials } from "@/lib/utils"
import { getLanguageColor } from "@/lib/language-colors"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProjectCard } from "@/components/projects/project-card"
import {
  Github,
  ShieldCheck,
  GraduationCap,
  Star,
  GitFork,
  Users,
  BookOpen,
  ArrowBigUp,
  MessageSquare,
} from "lucide-react"

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

  const topLanguages = (user.githubTopLanguages as Record<string, number> | null) ?? {}
  const topLangEntries = Object.entries(topLanguages)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)

  // Build activity feed from votes + comments, sorted by date
  const activity = [
    ...user.votes.map((v) => ({
      type: "vote" as const,
      id: v.id,
      createdAt: v.createdAt,
      projectTitle: v.project.title,
      projectSlug: v.project.slug,
    })),
    ...user.comments.map((c) => ({
      type: "comment" as const,
      id: c.id,
      createdAt: c.createdAt,
      projectTitle: c.project.title,
      projectSlug: c.project.slug,
      content: c.content,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
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
          </div>

          {/* GitHub stats */}
          {(user.githubReposCount != null || user.githubTotalStars != null || user.githubFollowers != null) && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              {user.githubReposCount != null && (
                <div className="flex items-center gap-1">
                  <BookOpen className="size-3.5" />
                  <span className="font-medium text-foreground">{user.githubReposCount}</span> repos
                </div>
              )}
              {user.githubTotalStars != null && user.githubTotalStars > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="size-3.5" />
                  <span className="font-medium text-foreground">{user.githubTotalStars}</span> stars
                </div>
              )}
              {user.githubFollowers != null && user.githubFollowers > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="size-3.5" />
                  <span className="font-medium text-foreground">{user.githubFollowers}</span> followers
                </div>
              )}
            </div>
          )}

          {/* Top languages */}
          {topLangEntries.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {topLangEntries.map(([lang]) => (
                <Badge key={lang} variant="outline" className="text-xs">
                  <span
                    className="mr-1 inline-block size-2 rounded-full"
                    style={{ backgroundColor: getLanguageColor(lang) }}
                  />
                  {lang}
                </Badge>
              ))}
            </div>
          )}

          {/* Skills */}
          {user.skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-8">
          {/* Featured Repos */}
          {user.featuredRepos.length > 0 && (
            <section>
              <h2 className="mb-4 font-heading text-lg font-semibold">
                Featured Repos
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {user.featuredRepos.map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.htmlUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg border p-3 transition-colors hover:bg-accent"
                  >
                    <p className="text-sm font-medium">{repo.name}</p>
                    {repo.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {repo.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: getLanguageColor(repo.language) }}
                          />
                          {repo.language}
                        </span>
                      )}
                      {repo.stars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="size-3" />
                          {repo.stars}
                        </span>
                      )}
                      {repo.forks > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork className="size-3" />
                          {repo.forks}
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Recent Activity */}
          {activity.length > 0 && (
            <section>
              <h2 className="mb-4 font-heading text-lg font-semibold">
                Recent Activity
              </h2>
              <div className="space-y-2">
                {activity.slice(0, 10).map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-lg border p-3">
                    {item.type === "vote" ? (
                      <ArrowBigUp className="mt-0.5 size-4 shrink-0 text-primary" />
                    ) : (
                      <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm">
                        {item.type === "vote" ? "Upvoted" : "Commented on"}{" "}
                        <Link
                          href={`/projects/${item.projectSlug}`}
                          className="font-medium hover:underline"
                        >
                          {item.projectTitle}
                        </Link>
                      </p>
                      {"content" in item && item.content && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {item.content}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Projects */}
          <section>
            <h2 className="mb-4 font-heading text-lg font-semibold">
              Projects ({user.ownedProjects.length})
            </h2>
            {user.ownedProjects.length > 0 ? (
              <div className="grid gap-4">
                {user.ownedProjects.map((project) => (
                  <ProjectCard key={project.id} project={{
                    ...project,
                    owner: { name: user.name, image: user.image, username: user.username },
                    _count: project._count,
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
          </section>
        </div>
      </div>
    </div>
  )
}
