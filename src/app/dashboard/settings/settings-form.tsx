"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Github, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { TagInput } from "@/components/ui/tag-input"
import { EmailManagement } from "@/components/settings/email-management"
import { updateProfile } from "@/lib/actions/profile"
import { TECH_STACK_OPTIONS } from "@/lib/constants"

interface UserEmail {
  id: string
  email: string
  label: string | null
  verified: boolean
  primary: boolean
  createdAt: Date
}

interface SettingsFormProps {
  user: {
    username: string | null
    bio: string | null
    skills: string[]
    major: string | null
    graduationYear: number | null
    uhEmail: string | null
    uhEmailVerified: boolean
    githubUsername: string | null
  }
  emails: UserEmail[]
}

export function SettingsForm({ user, emails }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [bio, setBio] = useState(user.bio ?? "")
  const [skills, setSkills] = useState<string[]>(user.skills)
  const [major, setMajor] = useState(user.major ?? "")
  const [graduationYear, setGraduationYear] = useState(
    user.graduationYear?.toString() ?? ""
  )

  // UH email verification state
  const [uhEmail, setUhEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const [isSendingCode, startSendingCode] = useTransition()
  const [isVerifying, startVerifying] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
      toast.success("Profile updated!")
    })
  }

  function handleSendCode() {
    if (!uhEmail) {
      toast.error("Please enter your UH email address.")
      return
    }
    startSendingCode(async () => {
      const res = await fetch("/api/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: uhEmail }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Failed to send verification code.")
        return
      }
      setEmailSent(true)
      toast.success("Verification code sent! Check your email.")
    })
  }

  function handleVerifyCode() {
    if (!verificationCode) {
      toast.error("Please enter the verification code.")
      return
    }
    startVerifying(async () => {
      const res = await fetch("/api/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: uhEmail, code: verificationCode }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || "Verification failed.")
        return
      }
      toast.success("UH email verified!")
      router.refresh()
    })
  }

  return (
    <div className="space-y-6">
      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <Label className="text-muted-foreground">Username</Label>
            <p className="text-sm font-medium">@{user.username ?? "Not set"}</p>
          </div>
          {user.githubUsername && (
            <div className="space-y-1">
              <Label className="text-muted-foreground">GitHub</Label>
              <div className="flex items-center gap-2">
                <Github className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium font-mono">@{user.githubUsername}</span>
                <a
                  href={`https://github.com/${user.githubUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-3" />
                </a>
              </div>
            </div>
          )}
          <div className="space-y-2">
            <Label className="text-muted-foreground">UH Email</Label>
            {user.uhEmailVerified ? (
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">{user.uhEmail}</p>
                <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  <ShieldCheck className="mr-1 size-3" />
                  Verified
                </Badge>
              </div>
            ) : (
              <div className="space-y-3">
                {!emailSent ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder="your-email@uh.edu"
                      value={uhEmail}
                      onChange={(e) => setUhEmail(e.target.value)}
                    />
                    <Button
                      onClick={handleSendCode}
                      disabled={isSendingCode}
                      size="sm"
                    >
                      {isSendingCode && <Loader2 className="mr-2 size-4 animate-spin" />}
                      Send Code
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      Code sent to {uhEmail}
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter 6-digit code"
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyCode}
                        disabled={isVerifying}
                        size="sm"
                      >
                        {isVerifying && <Loader2 className="mr-2 size-4 animate-spin" />}
                        Verify
                      </Button>
                    </div>
                    <button
                      onClick={() => setEmailSent(false)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Use a different email
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Verify your @uh.edu or @cougarnet.uh.edu email to create and join projects.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emails */}
      <EmailManagement emails={emails} />

      {/* Profile Info */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-lg">Profile</CardTitle>
          <CardDescription>Update your profile information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell others about yourself..."
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
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
