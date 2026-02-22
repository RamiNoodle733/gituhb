import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { SettingsForm } from "./settings-form"

export default async function DashboardSettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  const [user, githubAccount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        username: true,
        bio: true,
        skills: true,
        major: true,
        graduationYear: true,
        uhEmail: true,
        uhEmailVerified: true,
        githubUsername: true,
      },
    }),
    prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" },
      select: { id: true },
    }),
  ])

  if (!user) {
    redirect("/auth/signin")
  }

  return (
    <div className="space-y-8">
      <h1 className="font-heading text-2xl font-bold tracking-tight">Settings</h1>
      <SettingsForm user={{ ...user, githubConnected: !!githubAccount }} />
    </div>
  )
}
