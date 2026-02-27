"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import {
  syncProjectGitHubData,
  getGitHubToken,
  fetchGitHubUserProfile,
  fetchUserRepos,
} from "@/lib/github"

export async function refreshGitHubData(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      githubRepoOwner: true,
      githubRepoName: true,
      ownerId: true,
      slug: true,
    },
  })

  if (!project?.githubRepoOwner || !project?.githubRepoName) {
    return { error: "No GitHub repository linked." }
  }

  const token = await getGitHubToken(project.ownerId)

  await syncProjectGitHubData(
    projectId,
    project.githubRepoOwner,
    project.githubRepoName,
    token
  )

  revalidatePath(`/projects/${project.slug}`)
  return {}
}

/**
 * Fetches the user's GitHub profile and repos, computes aggregate stats,
 * and updates the user record with the latest GitHub data.
 */
export async function syncGitHubUserStats() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const token = await getGitHubToken(session.user.id)
  if (!token) {
    return { error: "GitHub account not connected." }
  }

  try {
    const [profile, repos] = await Promise.all([
      fetchGitHubUserProfile(token),
      fetchUserRepos(token),
    ])

    const publicRepos = repos.filter((r) => !r.private)
    const totalStars = publicRepos.reduce((sum, r) => sum + r.stargazers_count, 0)

    // Compute top languages by repo count
    const langCounts: Record<string, number> = {}
    for (const repo of publicRepos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
      }
    }
    const topLanguages = Object.entries(langCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang]) => lang)

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        githubUsername: profile.login,
        githubProfileUrl: profile.html_url,
        githubBio: profile.bio,
        githubReposCount: publicRepos.length,
        githubTotalStars: totalStars,
        githubFollowers: profile.followers,
        githubTopLanguages: topLanguages,
        githubSyncedAt: new Date(),
      },
    })

    revalidatePath("/dashboard")
    return {}
  } catch (err) {
    console.error("syncGitHubUserStats error:", err)
    return { error: "Failed to sync GitHub data." }
  }
}

/**
 * Feature a GitHub repo on the user's profile.
 * Max 6 featured repos per user.
 */
export async function featureRepo(repo: {
  githubRepoId: number
  name: string
  fullName: string
  htmlUrl: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  topics: string[]
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  // Enforce max 6 featured repos
  const count = await prisma.featuredRepo.count({
    where: { userId: session.user.id },
  })
  if (count >= 6) {
    return { error: "You can feature a maximum of 6 repositories." }
  }

  await prisma.featuredRepo.upsert({
    where: {
      userId_githubRepoId: {
        userId: session.user.id,
        githubRepoId: repo.githubRepoId,
      },
    },
    create: {
      userId: session.user.id,
      githubRepoId: repo.githubRepoId,
      name: repo.name,
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      topics: repo.topics,
      displayOrder: count,
      syncedAt: new Date(),
    },
    update: {
      name: repo.name,
      fullName: repo.fullName,
      htmlUrl: repo.htmlUrl,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      topics: repo.topics,
      syncedAt: new Date(),
    },
  })

  revalidatePath("/dashboard/repos")
  return {}
}

/**
 * Unfeature a GitHub repo.
 */
export async function unfeatureRepo(githubRepoId: number) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  await prisma.featuredRepo.deleteMany({
    where: {
      userId: session.user.id,
      githubRepoId,
    },
  })

  revalidatePath("/dashboard/repos")
  return {}
}
