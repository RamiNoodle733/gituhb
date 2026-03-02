import Link from "next/link"
import { cn } from "@/lib/utils"

const sizeMap = {
  sm: "text-lg",
  md: "text-xl",
  lg: "text-4xl",
} as const

interface LogoProps {
  size?: "sm" | "md" | "lg"
  linked?: boolean
  className?: string
}

export function Logo({ size = "md", linked = true, className }: LogoProps) {
  const content = (
    <span className={cn("font-heading font-bold tracking-tight", sizeMap[size], className)}>
      Git<span className="text-primary">UH</span>b
    </span>
  )

  if (linked) {
    return (
      <Link href="/" className="hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
