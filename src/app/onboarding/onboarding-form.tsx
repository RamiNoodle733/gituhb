"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Check, ArrowRight, ArrowLeft, Github, CheckCircle2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { TagInput } from "@/components/ui/tag-input"
import { updateUsername, updateProfile } from "@/lib/actions/profile"
import { TECH_STACK_OPTIONS } from "@/lib/constants"

const STEPS = ["Username", "GitHub", "Profile"]

interface OnboardingFormProps {
  githubUsername?: string | null
}

export function OnboardingForm({ githubUsername }: OnboardingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Step 1 state
  const [username, setUsername] = useState("")

  // Step 3 state
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [major, setMajor] = useState("")
  const [graduationYear, setGraduationYear] = useState("")

  const isGithubConnected = !!githubUsername || searchParams.get("github") === "connected"

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
      toast.success("Username set!")
      setStep(1)
    })
  }

  function handleProfileSubmit() {
    startTransition(async () => {
      const result = await updateProfile({
        bio: bio || undefined,
        skills,
        major: major || undefined,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
      })
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Profile complete!")
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

      {/* Step 1: Username */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Choose a Username</CardTitle>
            <CardDescription>
              Pick a unique username for your GitUHb profile. This will be part of your profile URL.
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
              Continue
              <ArrowRight className="ml-2 size-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Connect GitHub */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Connect GitHub</CardTitle>
            <CardDescription>
              Link your GitHub account to import repositories, show your contributions, and let others find your work.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isGithubConnected ? (
              <div className="flex items-center gap-3 rounded-lg border border-uh-teal/30 bg-uh-teal/5 p-4">
                <CheckCircle2 className="size-5 text-uh-teal" />
                <div>
                  <p className="text-sm font-medium">
                    Connected as <span className="font-mono">@{githubUsername}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your GitHub account is linked. You can manage this in settings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button asChild className="w-full" variant="outline" size="lg">
                  <a href="/api/github/connect?returnTo=/onboarding">
                    <Github className="mr-2 size-5" />
                    Connect with GitHub
                  </a>
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We only request read access to your public profile.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <div className="flex gap-2">
              {!isGithubConnected && (
                <Button variant="outline" onClick={() => setStep(2)}>
                  Skip for now
                </Button>
              )}
              {isGithubConnected && (
                <Button onClick={() => setStep(2)}>
                  Continue
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Profile */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Complete Your Profile</CardTitle>
            <CardDescription>
              Tell others about yourself. All fields are optional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="A short bio about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="min-h-20"
              />
            </div>
            <div className="space-y-2">
              <Label>Skills</Label>
              <TagInput
                value={skills}
                onChange={setSkills}
                options={TECH_STACK_OPTIONS}
                placeholder="Add your skills..."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="major">Major</Label>
                <Input
                  id="major"
                  placeholder="e.g. Computer Science"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gradYear">Graduation Year</Label>
                <Input
                  id="gradYear"
                  type="number"
                  placeholder="e.g. 2026"
                  value={graduationYear}
                  onChange={(e) => setGraduationYear(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <Button onClick={handleProfileSubmit} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Finish Setup
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
