"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, ShieldCheck } from "lucide-react"

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
import { Separator } from "@/components/ui/separator"
import { TagInput } from "@/components/ui/tag-input"
import { UhEmailVerification } from "@/components/settings/uh-email-verification"
import { updateProfile } from "@/lib/actions/profile"
import { TECH_STACK_OPTIONS } from "@/lib/constants"

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
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [bio, setBio] = useState(user.bio ?? "")
  const [skills, setSkills] = useState<string[]>(user.skills)
  const [major, setMajor] = useState(user.major ?? "")
  const [graduationYear, setGraduationYear] = useState(
    user.graduationYear?.toString() ?? ""
  )

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
              <p className="text-sm font-medium font-mono">@{user.githubUsername}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* UH Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">UH Email Verification</CardTitle>
            {user.uhEmailVerified && (
              <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                <ShieldCheck className="mr-1 size-3" />
                Verified
              </Badge>
            )}
          </div>
          <CardDescription>
            {user.uhEmailVerified
              ? `Verified with ${user.uhEmail}`
              : "Verify your UH email to apply to projects."}
          </CardDescription>
        </CardHeader>
        {!user.uhEmailVerified && (
          <CardContent>
            <UhEmailVerification />
          </CardContent>
        )}
      </Card>

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
