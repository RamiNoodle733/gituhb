"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function addComment(projectId: string, content: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in to comment." }
  }

  const trimmed = content.trim()
  if (trimmed.length < 1 || trimmed.length > 2000) {
    return { error: "Comment must be between 1 and 2000 characters." }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { slug: true },
  })

  if (!project) {
    return { error: "Project not found." }
  }

  await prisma.comment.create({
    data: {
      content: trimmed,
      userId: session.user.id,
      projectId,
    },
  })

  revalidatePath(`/projects/${project.slug}`)
  return {}
}

export async function deleteComment(commentId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: {
      userId: true,
      project: {
        select: { ownerId: true, slug: true },
      },
    },
  })

  if (!comment) {
    return { error: "Comment not found." }
  }

  const isAuthor = comment.userId === session.user.id
  const isProjectOwner = comment.project.ownerId === session.user.id

  if (!isAuthor && !isProjectOwner) {
    return { error: "You can only delete your own comments." }
  }

  await prisma.comment.delete({
    where: { id: commentId },
  })

  revalidatePath(`/projects/${comment.project.slug}`)
  return {}
}
