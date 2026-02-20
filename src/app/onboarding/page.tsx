import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Check if user already completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true },
  })

  if (user?.username) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Welcome to Git<span className="text-primary">UH</span>b
        </h1>
        <p className="mt-2 text-muted-foreground">
          Let&apos;s set up your profile in a few quick steps.
        </p>
      </div>
      <OnboardingForm />
    </div>
  )
}
