"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { syncProjectGitHubData, getGitHubToken } from "@/lib/github"

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
