"use client"

import { useState, useTransition } from "react"
import { ArrowBigUp, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { toggleVote } from "@/lib/actions/vote"

interface VoteButtonProps {
  projectId: string
  initialVoted: boolean
  initialCount: number
}

export function VoteButton({ projectId, initialVoted, initialCount }: VoteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [voted, setVoted] = useState(initialVoted)
  const [count, setCount] = useState(initialCount)

  function handleVote() {
    startTransition(async () => {
      const result = await toggleVote(projectId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setVoted(!!result.voted)
      setCount((prev) => (result.voted ? prev + 1 : prev - 1))
    })
  }

  return (
    <Button
      variant={voted ? "default" : "outline"}
      size="sm"
      onClick={handleVote}
      disabled={isPending}
      className="gap-1.5"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <ArrowBigUp className={`size-4 ${voted ? "fill-current" : ""}`} />
      )}
      <span>{count}</span>
    </Button>
  )
}
