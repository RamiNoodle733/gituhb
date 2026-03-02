"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function toggleVote(projectId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to vote." }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })

  if (!project) {
    return { error: "Project not found." }
  }

  const existing = await prisma.projectVote.findUnique({
    where: {
      userId_projectId: {
        userId: session.user.id,
        projectId,
      },
    },
  })

  if (existing) {
    await prisma.projectVote.delete({
      where: { id: existing.id },
    })
  } else {
    await prisma.projectVote.create({
      data: {
        userId: session.user.id,
        projectId,
      },
    })
  }

  revalidatePath(`/projects/${project.slug}`)
  revalidatePath("/projects")
  revalidatePath("/")
  return { voted: !existing }
}
