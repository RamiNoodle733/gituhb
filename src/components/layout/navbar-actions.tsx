"use client"

import { useState } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { useTheme } from "next-themes"
import {
  Menu,
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  User,
  Settings,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"
import { getInitials } from "@/lib/utils"

interface NavbarActionsProps {
  user: {
    id: string
    name: string | null
    image: string | null
    username: string | null
  } | null
}

export function NavbarActions({ user }: NavbarActionsProps) {
  const { setTheme, theme } = useTheme()
  const [open, setOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      {/* Theme toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="size-9"
      >
        <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>

      {user ? (
        <>
          {/* Desktop dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" className="relative size-9 rounded-full">
                <Avatar className="size-9">
                  {user.image && (
                    <AvatarImage src={user.image} alt={user.name ?? "User"} />
                  )}
                  <AvatarFallback>
                    {getInitials(user.name ?? "U")}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user.name ?? "User"}</p>
                {user.username && (
                  <p className="text-xs text-muted-foreground">
                    @{user.username}
                  </p>
                )}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">
                  <LayoutDashboard className="mr-2 size-4" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              {user.username && (
                <DropdownMenuItem asChild>
                  <Link href={`/profile/${user.username}`}>
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 size-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
                <LogOut className="mr-2 size-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile menu */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="size-9">
                <Menu className="size-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <SheetTitle className="font-heading">
                Git<span className="text-primary">UH</span>b
              </SheetTitle>
              <nav className="mt-6 flex flex-col gap-3">
                <Link
                  href="/projects"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium"
                >
                  Projects
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium"
                >
                  Dashboard
                </Link>
                {user.username && (
                  <Link
                    href={`/profile/${user.username}`}
                    onClick={() => setOpen(false)}
                    className="text-sm font-medium"
                  >
                    Profile
                  </Link>
                )}
                <Link
                  href="/dashboard/settings"
                  onClick={() => setOpen(false)}
                  className="text-sm font-medium"
                >
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left text-sm font-medium text-destructive"
                >
                  Sign Out
                </button>
              </nav>
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/auth/signin">Sign In</Link>
        </Button>
      )}

      {/* Mobile sign in when not logged in */}
      {!user && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="size-9">
              <Menu className="size-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <SheetTitle className="font-heading">
              Git<span className="text-primary">UH</span>b
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-3">
              <Link
                href="/projects"
                onClick={() => setOpen(false)}
                className="text-sm font-medium"
              >
                Projects
              </Link>
              <Link
                href="/auth/signin"
                onClick={() => setOpen(false)}
                className="text-sm font-medium"
              >
                Sign In
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
