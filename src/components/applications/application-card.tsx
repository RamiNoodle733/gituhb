"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn, getInitials, formatDate } from "@/lib/utils"
import { updateApplicationStatus } from "@/lib/actions/application"
import { ApplicationStatus } from "@/generated/prisma"

interface ApplicationCardProps {
  application: {
    id: string
    message: string
    status: string
    createdAt: Date
    user: {
      id: string
      name: string | null
      image: string | null
      username: string | null
    }
    role: {
      title: string
    }
  }
  projectId: string
}

const statusStyles: Record<string, { className: string; label: string }> = {
  PENDING: {
    className:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300",
    label: "Pending",
  },
  ACCEPTED: {
    className:
      "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300",
    label: "Accepted",
  },
  REJECTED: {
    className:
      "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
    label: "Rejected",
  },
  WITHDRAWN: {
    className: "bg-muted text-muted-foreground",
    label: "Withdrawn",
  },
}

export function ApplicationCard({
  application,
  projectId,
}: ApplicationCardProps) {
  const [isPending, startTransition] = useTransition()

  function handleStatusUpdate(status: ApplicationStatus) {
    startTransition(async () => {
      try {
        const result = await updateApplicationStatus(
          application.id,
          projectId,
          status
        )
        if (result?.error) {
          toast.error(result.error)
          return
        }
        toast.success(
          `Application ${status === ApplicationStatus.ACCEPTED ? "accepted" : "rejected"}`
        )
      } catch {
        toast.error("Something went wrong. Please try again.")
      }
    })
  }

  const statusInfo = statusStyles[application.status] ?? statusStyles.PENDING

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar>
              {application.user.image && (
                <AvatarImage
                  src={application.user.image}
                  alt={application.user.name ?? "Applicant"}
                />
              )}
              <AvatarFallback>
                {getInitials(application.user.name ?? "?")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <CardTitle className="text-sm font-heading font-semibold">
                {application.user.username ? (
                  <Link
                    href={`/profile/${application.user.username}`}
                    className="hover:underline"
                  >
                    {application.user.name ?? application.user.username}
                  </Link>
                ) : (
                  application.user.name ?? "Unknown User"
                )}
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Applied for {application.role.title}</span>
                <span>&middot;</span>
                <span>{formatDate(new Date(application.createdAt))}</span>
              </div>
            </div>
          </div>
          <Badge
            variant="outline"
            className={cn("shrink-0 text-xs", statusInfo.className)}
          >
            {statusInfo.label}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {application.message}
        </p>
      </CardContent>

      {application.status === "PENDING" && (
        <CardFooter className="gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusUpdate(ApplicationStatus.ACCEPTED)}
            disabled={isPending}
            className="bg-teal-600 hover:bg-teal-700 text-white"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Check className="size-4" />
            )}
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleStatusUpdate(ApplicationStatus.REJECTED)}
            disabled={isPending}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <X className="size-4" />
            )}
            Reject
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
