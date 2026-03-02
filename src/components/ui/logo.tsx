import Link from "next/link"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: { box: "h-8 w-8", text: "text-lg", gap: "gap-2" },
  md: { box: "h-10 w-10", text: "text-xl", gap: "gap-2.5" },
  lg: { box: "h-16 w-16", text: "text-4xl", gap: "gap-3" },
} as const

interface LogoProps {
  size?: "sm" | "md" | "lg"
  linked?: boolean
  className?: string
}

export function Logo({ size = "md", linked = true, className }: LogoProps) {
  const s = sizeMap[size]

  const content = (
    <div className={cn("flex items-center", s.gap, className)}>
      {/* Placeholder box — replace with <Image> when logo is ready */}
      <div
        className={cn(
          "flex items-center justify-center rounded-lg border-2 border-primary bg-primary/10 font-display uppercase leading-none text-primary",
          s.box,
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          size === "lg" && "text-lg"
        )}
      >
        G
      </div>
      <span className={cn("font-heading font-bold tracking-tight", s.text)}>
        Git<span className="text-primary">UH</span>b
      </span>
    </div>
  )

  if (linked) {
    return (
      <Link href="/" className="flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
