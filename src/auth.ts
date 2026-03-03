import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { authConfig } from "@/auth.config"
import { fetchGitHubUserProfile, fetchUserRepos } from "@/lib/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
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
    async signIn({ user, account }) {
      try {
        if (account?.provider === "github" && account.access_token && user.id) {
          const token = account.access_token

          try {
            const [profile, repos] = await Promise.all([
              fetchGitHubUserProfile(token),
              fetchUserRepos(token),
            ])

            const publicRepos = repos.filter((r) => !r.private)
            const totalStars = publicRepos.reduce((sum, r) => sum + r.stargazers_count, 0)

            const langCounts: Record<string, number> = {}
            for (const repo of publicRepos) {
              if (repo.language) {
                langCounts[repo.language] = (langCounts[repo.language] || 0) + 1
              }
            }
            const topLanguages = Object.entries(langCounts)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([lang]) => lang)

            await prisma.user.update({
              where: { id: user.id },
              data: {
                githubUsername: profile.login,
                githubProfileUrl: profile.html_url,
                githubBio: profile.bio,
                githubReposCount: publicRepos.length,
                githubTotalStars: totalStars,
                githubFollowers: profile.followers,
                githubTopLanguages: topLanguages,
                githubSyncedAt: new Date(),
              },
            })
          } catch {
            // Stats sync failed — save basic GitHub info from the account
            // The profile data from the OAuth response isn't directly available here,
            // so we just skip if the API calls fail
          }
        }
      } catch (error) {
        console.error("Error in signIn event:", error)
      }
    },
  },
})
