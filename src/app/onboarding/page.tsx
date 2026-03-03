import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function OnboardingPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Username is now set automatically from GitHub on sign-in
  redirect("/dashboard")
}
