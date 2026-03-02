import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { Logo } from "@/components/ui/logo"
import { OnboardingForm } from "./onboarding-form"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Check if user already completed onboarding
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { username: true, githubUsername: true },
  })

  // Only redirect if both username and GitHub are set (onboarding fully complete)
  if (user?.username && user?.githubUsername) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mb-4 flex justify-center">
          <Logo size="md" linked={false} />
        </div>
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Welcome to GitUHb
        </h1>
        <p className="mt-2 text-muted-foreground">
          Let&apos;s get you set up in a few quick steps.
        </p>
      </div>
      <OnboardingForm githubUsername={user?.githubUsername} />
    </div>
  )
}
