"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Plus, Trash2, Star, Mail } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { addEmail, removeEmail, setPrimaryEmail } from "@/lib/actions/email"

interface UserEmail {
  id: string
  email: string
  label: string | null
  verified: boolean
  primary: boolean
  createdAt: Date
}

interface EmailManagementProps {
  emails: UserEmail[]
}

export function EmailManagement({ emails }: EmailManagementProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [newEmail, setNewEmail] = useState("")
  const [newLabel, setNewLabel] = useState("personal")
  const [isAdding, startAddTransition] = useTransition()
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [isRemoving, startRemoveTransition] = useTransition()
  const [settingPrimaryId, setSettingPrimaryId] = useState<string | null>(null)
  const [isSettingPrimary, startPrimaryTransition] = useTransition()

  function handleAdd() {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address.")
      return
    }
    startAddTransition(async () => {
      const result = await addEmail(newEmail, newLabel)
      if (result?.error) {
        toast.error(result.error)
        return
      }
      toast.success("Email added!")
      setNewEmail("")
      setShowAdd(false)
      router.refresh()
    })
  }

  function handleRemove(id: string) {
    setRemovingId(id)
    startRemoveTransition(async () => {
      const result = await removeEmail(id)
      if (result?.error) {
        toast.error(result.error)
        setRemovingId(null)
        return
      }
      toast.success("Email removed.")
      setRemovingId(null)
      router.refresh()
    })
  }

  function handleSetPrimary(id: string) {
    setSettingPrimaryId(id)
    startPrimaryTransition(async () => {
      const result = await setPrimaryEmail(id)
      if (result?.error) {
        toast.error(result.error)
        setSettingPrimaryId(null)
        return
      }
      toast.success("Primary email updated.")
      setSettingPrimaryId(null)
      router.refresh()
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="font-heading text-lg">Emails</CardTitle>
            <CardDescription>
              Manage your email addresses. Add personal, UH, or work emails.
            </CardDescription>
          </div>
          {!showAdd && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdd(true)}
            >
              <Plus className="mr-1 size-4" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {emails.length === 0 && !showAdd && (
          <p className="text-sm text-muted-foreground">
            No emails added yet. Add your email addresses to your profile.
          </p>
        )}

        {emails.map((email) => (
          <div
            key={email.id}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Mail className="size-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-medium">{email.email}</p>
                  {email.primary && (
                    <Badge variant="secondary" className="text-[10px]">Primary</Badge>
                  )}
                  {email.label && (
                    <Badge variant="outline" className="text-[10px]">{email.label}</Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {!email.primary && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => handleSetPrimary(email.id)}
                  disabled={isSettingPrimary && settingPrimaryId === email.id}
                  title="Set as primary"
                >
                  {isSettingPrimary && settingPrimaryId === email.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Star className="size-3.5" />
                  )}
                </Button>
              )}
              {!email.primary && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  onClick={() => handleRemove(email.id)}
                  disabled={isRemoving && removingId === email.id}
                  title="Remove email"
                >
                  {isRemoving && removingId === email.id ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        ))}

        {showAdd && (
          <div className="space-y-3 rounded-lg border border-dashed p-3">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <div className="space-y-1">
                <Label htmlFor="newEmail" className="text-xs">Email</Label>
                <Input
                  id="newEmail"
                  placeholder="email@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Label</Label>
                <Select value={newLabel} onValueChange={setNewLabel}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="uh">UH</SelectItem>
                    <SelectItem value="work">Work</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAdd} disabled={isAdding}>
                {isAdding && <Loader2 className="mr-2 size-4 animate-spin" />}
                Add Email
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowAdd(false)
                  setNewEmail("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
