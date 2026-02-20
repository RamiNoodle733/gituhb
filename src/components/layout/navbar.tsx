import Link from "next/link"
import { auth } from "@/auth"
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
          <Link
            href="/"
            className="font-heading text-xl font-bold tracking-tight"
          >
            Git<span className="text-primary">UH</span>b
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
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

        <NavbarActions user={user} />
      </div>
    </header>
  )
}
