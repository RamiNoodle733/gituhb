"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Check, ArrowRight, ArrowLeft } from "lucide-react"

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
import { UhEmailVerification } from "@/components/settings/uh-email-verification"
import { updateUsername, updateProfile } from "@/lib/actions/profile"
import { TECH_STACK_OPTIONS } from "@/lib/constants"

const STEPS = ["Username", "UH Email", "Profile"]

export function OnboardingForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Step 1 state
  const [username, setUsername] = useState("")

  // Step 3 state
  const [bio, setBio] = useState("")
  const [skills, setSkills] = useState<string[]>([])
  const [major, setMajor] = useState("")
  const [graduationYear, setGraduationYear] = useState("")

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

      {/* Step 2: UH Email */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="font-heading">Verify UH Email</CardTitle>
            <CardDescription>
              Verify your University of Houston email to apply to projects.
              You can skip this for now and verify later in settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UhEmailVerification />
          </CardContent>
          <CardFooter className="justify-between">
            <Button variant="ghost" onClick={() => setStep(0)}>
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Skip for now
              </Button>
              <Button onClick={() => setStep(2)}>
                Continue
                <ArrowRight className="ml-2 size-4" />
              </Button>
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
