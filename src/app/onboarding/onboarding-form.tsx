"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, ArrowRight } from "lucide-react"

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

export function OnboardingForm() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [username, setUsername] = useState("")

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
  )
}
