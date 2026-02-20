"use client"

import { useState, useCallback, useEffect } from "react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { Search, X } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { TECH_STACK_OPTIONS, TIME_COMMITMENT_LABELS } from "@/lib/constants"
import { cn } from "@/lib/utils"

const STATUS_OPTIONS = ["ACTIVE", "PAUSED", "COMPLETED"] as const
const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  PAUSED: "Paused",
  COMPLETED: "Completed",
}

export function ProjectFilters() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [search, setSearch] = useState(searchParams.get("search") ?? "")
  const [showAllTech, setShowAllTech] = useState(false)

  const updateParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get(key)?.split(",").filter(Boolean) ?? []
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      if (updated.length > 0) {
        params.set(key, updated.join(","))
      } else {
        params.delete(key)
      }
      params.delete("page")
      router.push(`${pathname}?${params.toString()}`)
    },
    [searchParams, router, pathname]
  )

  const clearFilters = useCallback(() => {
    setSearch("")
    router.push(pathname)
  }, [router, pathname])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSearch = searchParams.get("search") ?? ""
      if (search !== currentSearch) {
        updateParams("search", search || null)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [search, searchParams, updateParams])

  const activeTimeCommitments =
    searchParams.get("timeCommitment")?.split(",").filter(Boolean) ?? []
  const activeStatuses =
    searchParams.get("status")?.split(",").filter(Boolean) ?? []
  const activeTech =
    searchParams.get("tech")?.split(",").filter(Boolean) ?? []

  const hasFilters =
    search ||
    activeTimeCommitments.length > 0 ||
    activeStatuses.length > 0 ||
    activeTech.length > 0

  const visibleTechOptions = showAllTech
    ? TECH_STACK_OPTIONS
    : TECH_STACK_OPTIONS.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Search</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Time Commitment */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Time Commitment</Label>
        <div className="space-y-2">
          {Object.entries(TIME_COMMITMENT_LABELS).map(([value, label]) => (
            <label
              key={value}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeTimeCommitments.includes(value)}
                onChange={() => toggleArrayParam("timeCommitment", value)}
                className="rounded border-input"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        <div className="space-y-2">
          {STATUS_OPTIONS.map((status) => (
            <label
              key={status}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeStatuses.includes(status)}
                onChange={() => toggleArrayParam("status", status)}
                className="rounded border-input"
              />
              {STATUS_LABELS[status]}
            </label>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tech Stack</Label>
        <div className="space-y-2">
          {visibleTechOptions.map((tech) => (
            <label
              key={tech}
              className="flex items-center gap-2 text-sm cursor-pointer"
            >
              <input
                type="checkbox"
                checked={activeTech.includes(tech)}
                onChange={() => toggleArrayParam("tech", tech)}
                className="rounded border-input"
              />
              <span className="font-mono text-xs">{tech}</span>
            </label>
          ))}
          {TECH_STACK_OPTIONS.length > 10 && (
            <Button
              type="button"
              variant="link"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={() => setShowAllTech(!showAllTech)}
            >
              {showAllTech
                ? "Show less"
                : `Show ${TECH_STACK_OPTIONS.length - 10} more`}
            </Button>
          )}
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="size-4" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
