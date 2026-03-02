"use client"

import { useState, useEffect, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Check, ArrowRight, Github } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { updateUsername } from "@/lib/actions/profile"

const STEPS = ["Connect GitHub", "Choose Username"]

interface OnboardingFormProps {
  githubUsername?: string | null
}

export function OnboardingForm({ githubUsername }: OnboardingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()

  const [username, setUsername] = useState("")

  const isGithubConnected = !!githubUsername || searchParams.get("github") === "connected"

  useEffect(() => {
    if (step === 0 && isGithubConnected) {
      setStep(1)
    }
  }, [step, isGithubConnected])

  function handleUsernameSubmit() {
    if (username.length < 3) {
      toast.error("Username must be at least 3 characters.")
      return
    }
    startTransition(async () => {
      const result = await updateUsername(username)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("You're all set!")
      router.push("/dashboard")
      router.refresh()
    })
  }

  return (
    <div>
      {/* Progress dots */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-xs font-medium ${
                i < step
                  ? "bg-primary text-primary-foreground"
                  : i === step
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            <span className="hidden text-sm sm:inline">{label}</span>
            {i < STEPS.length - 1 && (
              <div className="mx-1 h-px w-8 bg-border" />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: Connect GitHub (required) */}
      {step === 0 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex size-16 items-center justify-center rounded-full bg-muted">
              <Github className="size-8 text-foreground" />
            </div>
            <CardTitle className="font-heading">Connect Your GitHub</CardTitle>
            <CardDescription>
              GitHub is at the core of GitUHb. Connect your account to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button asChild className="w-full" size="lg">
                <a href="/api/github/connect?returnTo=/onboarding">
                  <Github className="mr-2 size-5" />
                  Connect with GitHub
                </a>
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                We only request read access to your public profile and repositories.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 1: Username */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Choose a Username</CardTitle>
            <CardDescription>
              Pick a unique username for your GitUHb profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                placeholder="e.g. john-doe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUsernameSubmit()}
              />
              <p className="text-xs text-muted-foreground">
                3-30 characters. Letters, numbers, and hyphens only.
              </p>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button onClick={handleUsernameSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
