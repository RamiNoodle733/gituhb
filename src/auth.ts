import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async session({ session, user }) {
      session.user.id = user.id
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          username: true,
          uhEmail: true,
          uhEmailVerified: true,
          githubUsername: true,
          skills: true,
          bio: true,
          major: true,
          graduationYear: true,
        },
      })
      if (dbUser) {
        session.user.username = dbUser.username
        session.user.uhEmailVerified = dbUser.uhEmailVerified
        session.user.githubUsername = dbUser.githubUsername
      }
      return session
    },
    async signIn({ user, account, profile }) {
      if (account?.provider === "github" && profile) {
        const githubProfile = profile as {
          login?: string
          html_url?: string
          avatar_url?: string
        }
        await prisma.user.update({
          where: { id: user.id! },
          data: {
            githubUsername: githubProfile.login,
            githubProfileUrl: githubProfile.html_url,
            image: githubProfile.avatar_url,
          },
        })
      }
      return true
    },
  },
})
