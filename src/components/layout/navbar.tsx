import Link from "next/link"
import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import { NavbarActions } from "./navbar-actions"

export async function Navbar() {
  const session = await auth()

  const user = session?.user
    ? {
        id: session.user.id!,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
        username: (session.user as any).username ?? null,
      }
    : null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Logo size="md" />

          <nav className="hidden items-center gap-6 md:flex">
            {user && (
              <Link
                href="/dashboard/repos"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                My Repos
              </Link>
            )}
            <Link
              href="/projects"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Projects
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <Button size="sm" asChild className="hidden md:inline-flex">
              <Link href="/dashboard/repos">Post a Repo</Link>
            </Button>
          )}
          <NavbarActions user={user} />
        </div>
      </div>
    </header>
  )
}
