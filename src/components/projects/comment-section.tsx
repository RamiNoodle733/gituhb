"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { getInitials } from "@/lib/utils"
import { addComment, deleteComment } from "@/lib/actions/comment"

interface Comment {
  id: string
  content: string
  createdAt: Date
  user: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

interface CommentSectionProps {
  projectId: string
  comments: Comment[]
  currentUserId?: string
  projectOwnerId: string
  isAuthenticated: boolean
}

export function CommentSection({
  projectId,
  comments,
  currentUserId,
  projectOwnerId,
  isAuthenticated,
}: CommentSectionProps) {
  const router = useRouter()
  const [content, setContent] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    startTransition(async () => {
      const result = await addComment(projectId, content)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setContent("")
      router.refresh()
    })
  }

  return (
    <section>
      <h2 className="font-heading mb-4 text-xl font-semibold">
        Comments ({comments.length})
      </h2>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-3">
          <Textarea
            placeholder="Leave a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-20 resize-none"
            maxLength={2000}
          />
          <Button type="submit" size="sm" disabled={isPending || !content.trim()}>
            {isPending && <Loader2 className="mr-2 size-3.5 animate-spin" />}
            Post Comment
          </Button>
        </form>
      ) : (
        <p className="mb-6 rounded-lg border p-4 text-center text-sm text-muted-foreground">
          Sign in to leave a comment.
        </p>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              canDelete={
                currentUserId === comment.user.id ||
                currentUserId === projectOwnerId
              }
            />
          ))}
        </div>
      )}
    </section>
  )
}

function CommentCard({
  comment,
  canDelete,
}: {
  comment: Comment
  canDelete: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteComment(comment.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex gap-3 rounded-lg border p-3">
      <Avatar className="size-8 shrink-0">
        {comment.user.image && (
          <AvatarImage src={comment.user.image} alt={comment.user.name ?? ""} />
        )}
        <AvatarFallback className="text-xs">
          {getInitials(comment.user.name ?? "?")}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.user.name ?? comment.user.username}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="ml-auto text-muted-foreground hover:text-destructive"
            >
              {isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
            </button>
          )}
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
          {comment.content}
        </p>
      </div>
    </div>
  )
}
