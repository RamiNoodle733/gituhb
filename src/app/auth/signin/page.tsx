import { redirect } from "next/navigation"
import { auth, signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { GraduationCap } from "lucide-react"

export default async function SignInPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 font-heading text-3xl font-bold">
            Git<span className="text-primary">UH</span>b
          </div>
          <CardTitle className="font-heading text-2xl">Sign in to GitUHb</CardTitle>
          <CardDescription>
            Sign in with your UH Microsoft 365 account to start collaborating on UH projects.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("microsoft-entra-id", { redirectTo: "/onboarding" })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <GraduationCap className="mr-2 size-5" />
              Sign in with UH Account
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="w-full text-center text-xs text-muted-foreground">
            Sign in with your University of Houston Microsoft 365 account.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
