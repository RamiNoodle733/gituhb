import { prisma } from "@/lib/prisma"
import type { Prisma } from "@/generated/prisma/client"

const PROJECTS_PER_PAGE = 12

interface GetProjectsParams {
  search?: string
  techStack?: string
  timeCommitment?: string
  status?: string
  page?: number
}

export async function getProjects({
  search,
  techStack,
  timeCommitment,
  status,
  page = 1,
}: GetProjectsParams) {
  const where: Prisma.ProjectWhereInput = {
    status: status ? (status as any) : "ACTIVE",
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  if (techStack) {
    where.techStack = { has: techStack }
  }

  if (timeCommitment) {
    where.timeCommitment = timeCommitment as any
  }

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
          select: { members: true },
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
        select: { members: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  })
}
