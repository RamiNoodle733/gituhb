import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Github } from "lucide-react"
import Link from "next/link"
import { ReposBrowser } from "@/components/repos/repos-browser"

export const metadata = {
  title: "My Repos",
  description: "Browse and manage your GitHub repositories",
}

export default async function ReposPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Check if the user has a GitHub account linked
  const githubAccount = await prisma.account.findFirst({
    where: { userId: session.user.id, provider: "github" },
    select: { id: true },
  })

  if (!githubAccount) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Repos</h1>
          <p className="text-muted-foreground">
            Connect your GitHub account to browse and share your repositories.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
          <div className="rounded-full bg-muted p-4">
            <Github className="size-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">GitHub Not Connected</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Link your GitHub account to see your repositories here. You can post
            them for collaboration or feature them on your profile.
          </p>
          <Link
            href="/api/github/connect?returnTo=/dashboard/repos"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Github className="size-4" />
            Connect GitHub
          </Link>
        </div>
      </div>
    )
  }

  // Get featured repo IDs for the user
  const featuredRepos = await prisma.featuredRepo.findMany({
    where: { userId: session.user.id },
    select: { githubRepoId: true },
    orderBy: { displayOrder: "asc" },
  })
  const featuredRepoIds = featuredRepos.map((r) => r.githubRepoId)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Repos</h1>
        <p className="text-muted-foreground">
          Browse your GitHub repositories. Post them for collaboration or feature
          them on your profile.
        </p>
      </div>
      <ReposBrowser featuredRepoIds={featuredRepoIds} />
    </div>
  )
}
