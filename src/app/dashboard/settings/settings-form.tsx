"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ShieldCheck, Github, ExternalLink, CheckCircle2, Unlink } from "lucide-react"

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
    githubConnected: boolean
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isDisconnecting, startDisconnectTransition] = useTransition()
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

  function handleDisconnect() {
    startDisconnectTransition(async () => {
      const res = await fetch("/api/github/disconnect", { method: "POST" })
      if (!res.ok) {
        toast.error("Failed to disconnect GitHub account.")
        return
      }
      toast.success("GitHub account disconnected.")
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
            Connect your GitHub account to import repositories and display your contributions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user.githubConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-uh-teal/30 bg-uh-teal/5 p-4">
                <CheckCircle2 className="size-5 shrink-0 text-uh-teal" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    Connected as <span className="font-mono">@{user.githubUsername}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Your GitHub account is linked via OAuth.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="text-destructive hover:text-destructive"
              >
                {isDisconnecting ? (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                ) : (
                  <Unlink className="mr-2 size-4" />
                )}
                Disconnect GitHub
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button asChild variant="outline" size="lg" className="w-full">
                <a href="/api/github/connect?returnTo=/dashboard/settings">
                  <Github className="mr-2 size-5" />
                  Connect with GitHub
                </a>
              </Button>
              <p className="text-xs text-muted-foreground">
                We only request read access to your public profile and repositories.
              </p>
            </div>
          )}
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
