"use client"

import { useState, useTransition } from "react"
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
import { updateProfile, updateGithubUsername } from "@/lib/actions/profile"
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
  const [isGhPending, startGhTransition] = useTransition()
  const [bio, setBio] = useState(user.bio ?? "")
  const [skills, setSkills] = useState<string[]>(user.skills)
  const [major, setMajor] = useState(user.major ?? "")
  const [graduationYear, setGraduationYear] = useState(
    user.graduationYear?.toString() ?? ""
  )
  const [githubUsername, setGithubUsername] = useState(user.githubUsername ?? "")

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

  function handleGithubSubmit(e: React.FormEvent) {
    e.preventDefault()
    startGhTransition(async () => {
      const result = await updateGithubUsername(githubUsername)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success(githubUsername.trim() ? "GitHub account linked!" : "GitHub account removed.")
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
          <div className="space-y-1">
            <Label className="text-muted-foreground">UH Email</Label>
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">{user.uhEmail ?? "Not available"}</p>
              {user.uhEmailVerified && (
                <Badge className="bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">
                  <ShieldCheck className="mr-1 size-3" />
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Automatically verified through your UH Microsoft account.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* GitHub Connection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-heading text-lg">GitHub</CardTitle>
            {user.githubUsername && (
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <ExternalLink className="size-3" />
                View profile
              </a>
            )}
          </div>
          <CardDescription>
            Link your GitHub account so others can find your work and repositories.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGithubSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="github-username">GitHub Username</Label>
              <div className="relative">
                <Github className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="github-username"
                  placeholder="e.g. octocat"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Leave empty to remove your GitHub connection.
              </p>
            </div>
            <Button type="submit" size="sm" disabled={isGhPending}>
              {isGhPending && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save GitHub
            </Button>
          </form>
        </CardContent>
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
