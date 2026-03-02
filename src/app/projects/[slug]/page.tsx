import { Suspense } from "react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getProjectBySlug } from "@/lib/queries/projects"
import { getGitHubToken, parseGitHubRepoUrl } from "@/lib/github"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { ExternalLink, Pencil, Settings, Github, Loader2 } from "lucide-react"
import { formatDate, getInitials } from "@/lib/utils"
import { JoinProjectButton } from "@/components/projects/join-project-button"
import { VoteButton } from "@/components/projects/vote-button"
import { CommentSection } from "@/components/projects/comment-section"
import { RepoStats } from "@/components/github/repo-stats"
import { GitHubReadme } from "@/components/projects/github-readme"
import { GitHubCommits } from "@/components/projects/github-commits"
import { GitHubIssues } from "@/components/projects/github-issues"
import { GitHubContributors } from "@/components/projects/github-contributors"

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "bg-uh-teal/10 text-uh-teal border-uh-teal/20",
  PAUSED: "bg-uh-gold/10 text-uh-gold border-uh-gold/20",
}

function GitHubSkeleton({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg border p-4 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin" />
      Loading {label}...
    </div>
  )
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
  const isMember = session?.user?.id
    ? project.members.some((m) => m.userId === session.user!.id)
    : false
  const showJoin =
    !isOwner &&
    !isMember &&
    !!session?.user &&
    project.status === "ACTIVE"

  const hasVoted = session?.user?.id
    ? !!(await prisma.projectVote.findUnique({
        where: {
          userId_projectId: {
            userId: session.user.id,
            projectId: project.id,
          },
        },
      }))
    : false

  const repoInfo = project.githubRepoUrl
    ? parseGitHubRepoUrl(project.githubRepoUrl)
    : null

  let token: string | null = null
  if (repoInfo) {
    token = await getGitHubToken(project.ownerId)
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-8">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
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
              <VoteButton
                projectId={project.id}
                initialVoted={hasVoted}
                initialCount={project._count.votes}
              />
            </div>
          </div>

          {/* Owner info */}
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
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
          <section>
            <p className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>

          {/* Tech badges */}
          {project.techStack.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="outline" className="font-mono text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          )}

          {/* GitHub sections */}
          {repoInfo && (
            <>
              <Suspense fallback={<GitHubSkeleton label="README" />}>
                <GitHubReadme
                  owner={repoInfo.owner}
                  repo={repoInfo.repo}
                  token={token}
                />
              </Suspense>

              <Suspense fallback={<GitHubSkeleton label="recent commits" />}>
                <GitHubCommits
                  owner={repoInfo.owner}
                  repo={repoInfo.repo}
                  token={token}
                />
              </Suspense>

              <Suspense fallback={<GitHubSkeleton label="open issues" />}>
                <GitHubIssues
                  owner={repoInfo.owner}
                  repo={repoInfo.repo}
                  token={token}
                />
              </Suspense>

              <Suspense fallback={<GitHubSkeleton label="contributors" />}>
                <GitHubContributors
                  owner={repoInfo.owner}
                  repo={repoInfo.repo}
                  token={token}
                />
              </Suspense>
            </>
          )}

          {/* Comments */}
          <CommentSection
            projectId={project.id}
            comments={project.comments}
            currentUserId={session?.user?.id}
            projectOwnerId={project.ownerId}
            isAuthenticated={!!session?.user}
          />
        </div>

        {/* Sidebar */}
        <div className="w-full space-y-4 lg:w-72 lg:shrink-0">
          {/* GitHub repo link */}
          {project.githubRepoUrl && (
            <Button variant="outline" className="w-full" asChild>
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="mr-2 size-4" />
                View on GitHub
                <ExternalLink className="ml-auto size-3" />
              </a>
            </Button>
          )}

          {/* Repo stats */}
          {(project.githubStars != null || project.githubLanguages) && (
            <RepoStats
              stars={project.githubStars}
              forks={project.githubForks}
              openIssues={project.githubOpenIssues}
              languages={project.githubLanguages as Record<string, number> | null}
            />
          )}

          {/* Join button */}
          {showJoin && (
            <JoinProjectButton projectId={project.id} hasApplied={hasApplied} />
          )}

          {/* Team */}
          {project.members.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">
                  Team ({project.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2"
                  >
                    <Avatar className="size-6">
                      <AvatarImage src={member.user.image ?? undefined} />
                      <AvatarFallback className="text-[10px]">
                        {getInitials(member.user.name ?? "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        {member.user.name ?? member.user.username}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground">
                      {member.projectRole?.title ?? member.role}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Owner actions */}
          {isOwner && (
            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/projects/${project.slug}/edit`}>
                  <Pencil className="mr-2 size-4" />
                  Edit Project
                </Link>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/projects/${project.slug}/manage`}>
                  <Settings className="mr-2 size-4" />
                  Manage Members
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
