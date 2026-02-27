import { prisma } from "@/lib/prisma"

export async function getProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      uhEmailVerified: true,
      githubUsername: true,
      githubProfileUrl: true,
      githubReposCount: true,
      githubTotalStars: true,
      githubFollowers: true,
      githubTopLanguages: true,
      githubBio: true,
      githubSyncedAt: true,
      skills: true,
      major: true,
      graduationYear: true,
      createdAt: true,
      featuredRepos: {
        orderBy: { displayOrder: "asc" },
        select: {
          id: true,
          githubRepoId: true,
          name: true,
          fullName: true,
          htmlUrl: true,
          description: true,
          language: true,
          stars: true,
          forks: true,
          topics: true,
        },
      },
      ownedProjects: {
        where: { status: "ACTIVE" },
        include: {
          roles: { select: { id: true, title: true, filled: true } },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function getUserApplications(userId: string) {
  return prisma.application.findMany({
    where: { userId },
    include: {
      project: {
        select: { id: true, title: true, slug: true },
      },
      role: {
        select: { title: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}
