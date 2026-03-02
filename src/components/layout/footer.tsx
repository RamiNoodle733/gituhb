import Link from "next/link"
import { Logo } from "@/components/ui/logo"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-3">
          <Logo size="sm" linked={false} />
          <span className="text-sm text-muted-foreground">
            Built for Coogs
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link
            href="/projects"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Projects
          </Link>
          <Link
            href="/auth/signin"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign In
          </Link>
        </nav>

        <p className="text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} GitUHb. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
