"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { createProjectSchema, type CreateProjectInput } from "@/lib/validators/project"
import { MemberRole } from "@/generated/prisma/client"
import { parseGitHubRepoUrl, syncProjectGitHubData, getGitHubToken } from "@/lib/github"
import { LANGUAGE_TO_TECH, TAG_OPTIONS } from "@/lib/constants"

export async function createProject(data: CreateProjectInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a project." }
  }

  const parsed = createProjectSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  const { roles, ...projectData } = parsed.data

  // Generate unique slug
  let slug = slugify(projectData.title)
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  // Parse GitHub repo URL if provided
  const repoInfo = projectData.githubRepoUrl
    ? parseGitHubRepoUrl(projectData.githubRepoUrl)
    : null

  const project = await prisma.project.create({
    data: {
      ...projectData,
      slug,
      description: projectData.description,
      longDescription: projectData.longDescription || null,
      githubRepoUrl: projectData.githubRepoUrl || null,
      githubRepoOwner: repoInfo?.owner ?? null,
      githubRepoName: repoInfo?.repo ?? null,
      timeCommitment: projectData.timeCommitment as any,
      ownerId: session.user.id,
      roles: {
        create: roles.map((role) => ({
          title: role.title,
          description: role.description || null,
          count: role.count,
        })),
      },
      members: {
        create: {
          userId: session.user.id,
          role: MemberRole.OWNER,
        },
      },
    },
  })

  // Sync GitHub data in background (don't block the response)
  if (repoInfo) {
    getGitHubToken(session.user.id).then((token) => {
      syncProjectGitHubData(project.id, repoInfo.owner, repoInfo.repo, token).catch(
        console.error
      )
    })
  }

  revalidatePath("/projects")
  return { slug: project.slug }
}

export async function updateProject(projectId: string, data: CreateProjectInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, slug: true },
  })

  if (!project) {
    return { error: "Project not found." }
  }

  if (project.ownerId !== session.user.id) {
    return { error: "You don't have permission to edit this project." }
  }

  const parsed = createProjectSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  const { roles, status, ...projectData } = parsed.data

  // Parse GitHub repo URL if provided
  const repoInfo = projectData.githubRepoUrl
    ? parseGitHubRepoUrl(projectData.githubRepoUrl)
    : null

  // Delete existing roles and recreate
  await prisma.projectRole.deleteMany({ where: { projectId } })

  await prisma.project.update({
    where: { id: projectId },
    data: {
      ...projectData,
      longDescription: projectData.longDescription || null,
      githubRepoUrl: projectData.githubRepoUrl || null,
      githubRepoOwner: repoInfo?.owner ?? null,
      githubRepoName: repoInfo?.repo ?? null,
      timeCommitment: projectData.timeCommitment as any,
      ...(status ? { status: status as any } : {}),
      roles: {
        create: roles.map((role) => ({
          title: role.title,
          description: role.description || null,
          count: role.count,
        })),
      },
    },
  })

  // Sync GitHub data in background
  if (repoInfo) {
    getGitHubToken(session.user.id).then((token) => {
      syncProjectGitHubData(projectId, repoInfo.owner, repoInfo.repo, token).catch(
        console.error
      )
    })
  }

  revalidatePath(`/projects/${project.slug}`)
  revalidatePath("/projects")
  return {}
}

export async function deleteProject(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true },
  })

  if (!project) {
    return { error: "Project not found." }
  }

  if (project.ownerId !== session.user.id) {
    return { error: "You don't have permission to delete this project." }
  }

  await prisma.project.delete({ where: { id: projectId } })

  revalidatePath("/projects")
  revalidatePath("/dashboard/projects")
  return {}
}

/**
 * Quick-create a project from a GitHub repo with minimal user input.
 * Auto-generates title/slug from repo name, maps language to tech stack,
 * maps topics to tags, and creates the project with specified roles.
 */
export async function quickCreateProject(data: {
  repoName: string
  repoFullName: string
  repoUrl: string
  repoDescription: string | null
  repoLanguage: string | null
  repoTopics: string[]
  repoId: number
  timeCommitment: string
  roles: { title: string; description: string; count: number }[]
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to create a project." }
  }

  // Generate title from repo name (e.g. "my-cool-repo" -> "My Cool Repo")
  const title = data.repoName
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())

  // Generate unique slug
  let slug = slugify(title)
  const existing = await prisma.project.findUnique({ where: { slug } })
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`
  }

  // Map language to tech stack
  const techStack: string[] = []
  if (data.repoLanguage && LANGUAGE_TO_TECH[data.repoLanguage]) {
    techStack.push(LANGUAGE_TO_TECH[data.repoLanguage])
  }

  // Map topics to tags
  const tags: string[] = []
  const tagOptions = TAG_OPTIONS as readonly string[]
  for (const topic of data.repoTopics) {
    const normalized = topic.toLowerCase()
    const match = tagOptions.find(
      (t) => t.toLowerCase().replace(/\//g, "-") === normalized
    )
    if (match && !tags.includes(match)) {
      tags.push(match)
    }
  }

  // Parse repo URL
  const repoInfo = parseGitHubRepoUrl(data.repoUrl)

  const project = await prisma.project.create({
    data: {
      title,
      slug,
      description: data.repoDescription || `A project built with ${data.repoLanguage || "code"}.`,
      githubRepoUrl: data.repoUrl,
      githubRepoOwner: repoInfo?.owner ?? null,
      githubRepoName: repoInfo?.repo ?? null,
      githubRepoId: data.repoId,
      timeCommitment: data.timeCommitment as any,
      techStack,
      tags,
      ownerId: session.user.id,
      roles: {
        create: data.roles.map((role) => ({
          title: role.title,
          description: role.description || null,
          count: role.count,
        })),
      },
      members: {
        create: {
          userId: session.user.id,
          role: MemberRole.OWNER,
        },
      },
    },
  })

  // Sync GitHub data in background
  if (repoInfo) {
    getGitHubToken(session.user.id).then((token) => {
      syncProjectGitHubData(project.id, repoInfo.owner, repoInfo.repo, token).catch(
        console.error
      )
    })
  }

  revalidatePath("/projects")
  revalidatePath("/dashboard/projects")
  revalidatePath("/dashboard/repos")
  return { slug: project.slug }
}
