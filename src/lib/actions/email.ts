"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function addEmail(email: string, label?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const trimmed = email.trim().toLowerCase()
  if (!trimmed || !trimmed.includes("@")) {
    return { error: "Please enter a valid email address." }
  }

  // Check if this email is already added by this user
  const existing = await prisma.userEmail.findUnique({
    where: { userId_email: { userId: session.user.id, email: trimmed } },
  })

  if (existing) {
    return { error: "This email is already added to your account." }
  }

  await prisma.userEmail.create({
    data: {
      userId: session.user.id,
      email: trimmed,
      label: label || null,
      verified: false,
      primary: false,
    },
  })

  revalidatePath("/dashboard/settings")
  return {}
}

export async function removeEmail(emailId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const email = await prisma.userEmail.findUnique({
    where: { id: emailId },
    select: { userId: true, primary: true },
  })

  if (!email || email.userId !== session.user.id) {
    return { error: "Email not found." }
  }

  if (email.primary) {
    return { error: "Cannot remove your primary email." }
  }

  await prisma.userEmail.delete({ where: { id: emailId } })

  revalidatePath("/dashboard/settings")
  return {}
}

export async function setPrimaryEmail(emailId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  const email = await prisma.userEmail.findUnique({
    where: { id: emailId },
    select: { userId: true },
  })

  if (!email || email.userId !== session.user.id) {
    return { error: "Email not found." }
  }

  // Unset all primary, then set this one
  await prisma.$transaction([
    prisma.userEmail.updateMany({
      where: { userId: session.user.id },
      data: { primary: false },
    }),
    prisma.userEmail.update({
      where: { id: emailId },
      data: { primary: true },
    }),
  ])

  revalidatePath("/dashboard/settings")
  return {}
}
