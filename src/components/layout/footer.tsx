import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center gap-4 px-4 py-8 md:flex-row md:justify-between">
        <div className="flex items-center gap-2">
          <span className="font-heading text-lg font-bold">
            Git<span className="text-primary">UH</span>b
          </span>
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
