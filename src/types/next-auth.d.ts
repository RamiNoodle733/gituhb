import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string | null
      uhEmailVerified?: boolean
      githubUsername?: string | null
    } & DefaultSession["user"]
  }
}
