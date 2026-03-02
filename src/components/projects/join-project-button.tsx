"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { joinProject } from "@/lib/actions/application"

interface JoinProjectButtonProps {
  projectId: string
  hasApplied: boolean
}

export function JoinProjectButton({ projectId, hasApplied }: JoinProjectButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [applied, setApplied] = useState(hasApplied)

  if (applied) {
    return (
      <Button disabled variant="secondary" size="lg">
        <CheckCircle2 className="mr-2 size-4" />
        Requested to Join
      </Button>
    )
  }

  function handleJoin() {
    startTransition(async () => {
      const result = await joinProject(projectId)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      setApplied(true)
      toast.success("Join request sent!")
      router.refresh()
    })
  }

  return (
    <Button onClick={handleJoin} disabled={isPending} size="lg">
      {isPending && <Loader2 className="mr-2 size-4 animate-spin" />}
      Join This Project
    </Button>
  )
}
