"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { applicationSchema, type ApplicationInput } from "@/lib/validators/project"
import { ApplicationStatus, MemberRole } from "@/generated/prisma"

export async function applyToProject(projectId: string, data: ApplicationInput) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to apply." }
  }

  // Check UH email verification
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { uhEmailVerified: true },
  })

  if (!user?.uhEmailVerified) {
    return { error: "You must verify your UH email before applying to projects." }
  }

  const parsed = applicationSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." }
  }

  // Check project exists and user is not the owner
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { ownerId: true, slug: true, status: true },
  })

  if (!project) {
    return { error: "Project not found." }
  }

  if (project.ownerId === session.user.id) {
    return { error: "You cannot apply to your own project." }
  }

  if (project.status !== "ACTIVE") {
    return { error: "This project is not currently accepting applications." }
  }

  // Check for existing application
  const existing = await prisma.application.findUnique({
    where: {
      userId_projectId_roleId: {
        userId: session.user.id,
        projectId,
        roleId: parsed.data.roleId,
      },
    },
  })

  if (existing) {
    return { error: "You have already applied for this role." }
  }

  await prisma.application.create({
    data: {
      message: parsed.data.message,
      userId: session.user.id,
      projectId,
      roleId: parsed.data.roleId,
    },
  })

  revalidatePath(`/projects/${project.slug}/manage`)
  return {}
}

export async function updateApplicationStatus(
  applicationId: string,
  projectId: string,
  status: ApplicationStatus
) {
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
    return { error: "Only the project owner can manage applications." }
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, roleId: true, projectId: true },
  })

  if (!application || application.projectId !== projectId) {
    return { error: "Application not found." }
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status },
  })

  // If accepted, create project member
  if (status === ApplicationStatus.ACCEPTED) {
    await prisma.projectMember.upsert({
      where: {
        userId_projectId: {
          userId: application.userId,
          projectId,
        },
      },
      create: {
        userId: application.userId,
        projectId,
        projectRoleId: application.roleId,
        role: MemberRole.MEMBER,
      },
      update: {
        projectRoleId: application.roleId,
      },
    })

    // Mark the role as filled if all spots are taken
    const role = await prisma.projectRole.findUnique({
      where: { id: application.roleId },
      select: { count: true },
    })
    const memberCount = await prisma.projectMember.count({
      where: { projectRoleId: application.roleId },
    })
    if (role && memberCount >= role.count) {
      await prisma.projectRole.update({
        where: { id: application.roleId },
        data: { filled: true },
      })
    }
  }

  revalidatePath(`/projects/${project.slug}/manage`)
  revalidatePath(`/projects/${project.slug}`)
  return {}
}

export async function withdrawApplication(applicationId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { userId: true, status: true, project: { select: { slug: true } } },
  })

  if (!application) {
    return { error: "Application not found." }
  }

  if (application.userId !== session.user.id) {
    return { error: "You can only withdraw your own applications." }
  }

  if (application.status !== "PENDING") {
    return { error: "You can only withdraw pending applications." }
  }

  await prisma.application.update({
    where: { id: applicationId },
    data: { status: ApplicationStatus.WITHDRAWN },
  })

  revalidatePath(`/dashboard/applications`)
  revalidatePath(`/projects/${application.project.slug}/manage`)
  return {}
}
