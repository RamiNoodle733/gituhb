import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { email, code } = body as { email?: string; code?: string }

  if (!email || !code) {
    return NextResponse.json(
      { error: "Email and code are required." },
      { status: 400 }
    )
  }

  // Find valid verification record
  const verification = await prisma.uhEmailVerification.findFirst({
    where: {
      userId: session.user.id,
      email,
      code,
      expiresAt: { gt: new Date() },
    },
  })

  if (!verification) {
    return NextResponse.json(
      { error: "Invalid or expired verification code." },
      { status: 400 }
    )
  }

  // Update user with verified email
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      uhEmail: email,
      uhEmailVerified: true,
    },
  })

  // Clean up verification records
  await prisma.uhEmailVerification.deleteMany({
    where: { userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
