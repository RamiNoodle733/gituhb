import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
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
