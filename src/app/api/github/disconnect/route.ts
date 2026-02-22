import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function POST() {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Delete the GitHub Account record
  await prisma.account.deleteMany({
    where: {
      provider: "github",
      userId: session.user.id,
    },
  })

  // Clear GitHub fields on the User record
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      githubUsername: null,
      githubProfileUrl: null,
    },
  })

  revalidatePath("/dashboard/settings")

  return NextResponse.json({ success: true })
}
