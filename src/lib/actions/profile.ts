"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function updateProfile(data: {
  bio?: string
  skills?: string[]
  major?: string
  graduationYear?: number
}) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      bio: data.bio ?? null,
      skills: data.skills ?? [],
      major: data.major ?? null,
      graduationYear: data.graduationYear ?? null,
    },
  })

  revalidatePath("/dashboard/settings")
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`)
  }
  return {}
}

export async function updateUsername(username: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: "You must be signed in." }
  }

  // Validate format
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{1,28}[a-zA-Z0-9])?$/
  if (!usernameRegex.test(username)) {
    return { error: "Username must be 3-30 characters and contain only letters, numbers, and hyphens." }
  }

  // Check uniqueness
  const existing = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true },
  })

  if (existing && existing.id !== session.user.id) {
    return { error: "This username is already taken." }
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { username: username.toLowerCase() },
  })

  revalidatePath("/dashboard")
  return {}
}
