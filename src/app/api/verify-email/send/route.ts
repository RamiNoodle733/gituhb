import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isUhEmail, generateVerificationCode } from "@/lib/utils"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { email } = body as { email?: string }

  if (!email || !isUhEmail(email)) {
    return NextResponse.json(
      { error: "Please provide a valid UH email address (@uh.edu or @cougarnet.uh.edu)." },
      { status: 400 }
    )
  }

  // Check if email is already verified by another user
  const existingUser = await prisma.user.findFirst({
    where: { uhEmail: email, id: { not: session.user.id } },
    select: { id: true },
  })

  if (existingUser) {
    return NextResponse.json(
      { error: "This email is already verified by another account." },
      { status: 400 }
    )
  }

  // Delete existing verification codes for this user
  await prisma.uhEmailVerification.deleteMany({
    where: { userId: session.user.id },
  })

  // Generate and store code
  const code = generateVerificationCode()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  await prisma.uhEmailVerification.create({
    data: {
      userId: session.user.id,
      email,
      code,
      expiresAt,
    },
  })

  // Send email
  await sendVerificationEmail(email, code)

  return NextResponse.json({ success: true })
}
