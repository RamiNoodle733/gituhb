"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { isUhEmail } from "@/lib/utils"

interface UhEmailVerificationProps {
  currentUhEmail?: string | null
  isVerified?: boolean
}

export function UhEmailVerification({
  currentUhEmail,
  isVerified,
}: UhEmailVerificationProps) {
  const router = useRouter()

  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState(currentUhEmail ?? "")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isVerified && currentUhEmail) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-teal-200 bg-teal-50 p-4 dark:border-teal-800 dark:bg-teal-950/30">
        <CheckCircle2 className="size-5 shrink-0 text-teal-600 dark:text-teal-400" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-teal-800 dark:text-teal-200">
            UH Email Verified
          </p>
          <p className="text-sm text-teal-600 dark:text-teal-400">
            {currentUhEmail}
          </p>
        </div>
      </div>
    )
  }

  async function handleSendCode() {
    setError(null)

    if (!email.trim()) {
      setError("Please enter your UH email address.")
      return
    }

    if (!isUhEmail(email)) {
      setError("Please enter a valid UH email (@uh.edu or @cougarnet.uh.edu).")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/verify-email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Failed to send verification code.")
        return
      }

      toast.success("Verification code sent! Check your email.")
      setStep("code")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyCode() {
    setError(null)

    if (!code.trim() || code.length !== 6) {
      setError("Please enter the 6-digit verification code.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/verify-email/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Invalid verification code.")
        return
      }

      toast.success("Email verified successfully!")
      router.refresh()
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {step === "email" && (
        <div className="space-y-3">
          <Label htmlFor="uh-email">UH Email Address</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="uh-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError(null)
                }}
                placeholder="yourname@uh.edu"
                className="pl-9"
              />
            </div>
            <Button
              type="button"
              onClick={handleSendCode}
              disabled={loading}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Send Code
            </Button>
          </div>
        </div>
      )}

      {step === "code" && (
        <div className="space-y-3">
          <Label htmlFor="verify-code">Verification Code</Label>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to <span className="font-medium">{email}</span>.
          </p>
          <div className="flex gap-2">
            <Input
              id="verify-code"
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 6)
                setCode(val)
                setError(null)
              }}
              placeholder="000000"
              maxLength={6}
              className="font-mono tracking-widest"
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={loading}
            >
              {loading && <Loader2 className="size-4 animate-spin" />}
              Verify
            </Button>
          </div>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 text-xs"
            onClick={() => {
              setStep("email")
              setCode("")
              setError(null)
            }}
          >
            Use a different email
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  )
}
