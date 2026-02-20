import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { isUhEmail } from "@/lib/utils"

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
  },
  events: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "microsoft-entra-id" && profile && user.id) {
          const email = (
            (profile.email as string | undefined) ??
            (profile.preferred_username as string | undefined) ??
            (profile.mail as string | undefined)
          )?.toLowerCase()
          if (email && isUhEmail(email)) {
            await prisma.user.update({
              where: { id: user.id },
              data: {
                uhEmail: email,
                uhEmailVerified: true,
              },
            })
          }
        }
      } catch (error) {
        console.error("Error in signIn event:", error)
      }
    },
  },
})
