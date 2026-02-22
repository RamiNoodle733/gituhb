import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const session = await auth()

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const returnTo = searchParams.get("returnTo") || "/dashboard/settings"

  const state = crypto.randomUUID()

  const cookiePayload = JSON.stringify({ state, returnTo })

  const redirectUrl = new URL("https://github.com/login/oauth/authorize")
  redirectUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!)
  redirectUrl.searchParams.set(
    "redirect_uri",
    `${process.env.NEXT_PUBLIC_APP_URL}/api/github/callback`
  )
  redirectUrl.searchParams.set("scope", "read:user")
  redirectUrl.searchParams.set("state", state)

  const response = NextResponse.redirect(redirectUrl.toString())

  response.cookies.set("github_oauth_state", cookiePayload, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  })

  return response
}
