import { prisma } from "@/lib/prisma"

const PROJECTS_PER_PAGE = 20

export async function getProjects({ page = 1 }: { page?: number } = {}) {
  const where = { status: "ACTIVE" as const }

  const [projects, totalCount] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        owner: {
          select: { name: true, image: true, username: true },
        },
        roles: {
          select: { id: true, title: true, filled: true },
        },
        _count: {
          select: { members: true, votes: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PROJECTS_PER_PAGE,
      take: PROJECTS_PER_PAGE,
    }),
    prisma.project.count({ where }),
  ])

  return {
    projects,
    totalCount,
    totalPages: Math.ceil(totalCount / PROJECTS_PER_PAGE),
  }
}

export async function getProjectBySlug(slug: string) {
  return prisma.project.findUnique({
    where: { slug },
    include: {
      owner: {
        select: { id: true, name: true, username: true, image: true },
      },
      roles: {
        select: { id: true, title: true, description: true, filled: true, count: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
          projectRole: {
            select: { title: true },
          },
        },
      },
      applications: {
        include: {
          user: {
            select: { id: true, name: true, image: true, username: true },
          },
          role: {
            select: { title: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: {
          user: {
            select: { id: true, name: true, username: true, image: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      _count: {
        select: { votes: true, members: true },
      },
    },
  })
}

export async function getUserProjects(userId: string) {
  return prisma.project.findMany({
    where: { ownerId: userId },
    include: {
      roles: {
        select: { id: true, title: true, filled: true },
      },
      _count: {
        select: { members: true, applications: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getFeaturedProjects() {
  return prisma.project.findMany({
    where: { status: "ACTIVE" },
    include: {
      owner: {
        select: { name: true, image: true, username: true },
      },
      roles: {
        select: { id: true, title: true, filled: true },
      },
      _count: {
        select: { members: true, votes: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
}
