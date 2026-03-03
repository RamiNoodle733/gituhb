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
import { Logo } from "@/components/ui/logo"
import { Github } from "lucide-react"

export default async function SignInPage() {
  const session = await auth()
  if (session?.user) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <Logo size="md" linked={false} />
          </div>
          <CardTitle className="font-heading text-2xl">Sign in to GitUHb</CardTitle>
          <CardDescription>
            Sign in with your GitHub account to start collaborating with UH students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            action={async () => {
              "use server"
              await signIn("github", { redirectTo: "/dashboard" })
            }}
          >
            <Button type="submit" className="w-full" size="lg">
              <Github className="mr-2 size-5" />
              Sign in with GitHub
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-center text-xs text-muted-foreground">
          <p>Verify your UH email in Settings to create and join projects.</p>
          <p>Only UH students can create and join projects.</p>
        </CardFooter>
      </Card>
    </div>
  )
}
