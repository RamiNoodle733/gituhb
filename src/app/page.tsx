import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/project-card"
import { Logo } from "@/components/ui/logo"
import { getFeaturedProjects } from "@/lib/queries/projects"
import { prisma } from "@/lib/prisma"
import { Github } from "lucide-react"

export default async function HomePage() {
  const [featuredProjects, projectCount, userCount] = await Promise.all([
    getFeaturedProjects(),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
  ])

  // Sort by vote count (descending)
  const sortedProjects = [...featuredProjects].sort(
    (a, b) => (b._count.votes ?? 0) - (a._count.votes ?? 0)
  )

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center px-4 py-20 text-center md:py-28">
          <Logo size="lg" linked={false} className="mb-8 [&_span]:text-primary-foreground" />
          <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl md:text-7xl">
            The Official UH Student
            <br />
            Collaboration Platform
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-heading text-primary-foreground/80">
            Connect your GitHub. Find your team. Ship your project.
          </p>

          {/* Platform stats */}
          <div className="mt-6 flex gap-8 text-sm text-primary-foreground/70">
            <div>
              <span className="text-2xl font-bold text-primary-foreground">{projectCount}</span>
              <p>Active Projects</p>
            </div>
            <div>
              <span className="text-2xl font-bold text-primary-foreground">{userCount}</span>
              <p>Members</p>
            </div>
          </div>

          <Button size="lg" variant="secondary" asChild className="mt-8">
            <Link href="/auth/signin">
              <Github className="mr-2 size-5" />
              Get Started with GitHub
            </Link>
          </Button>
        </div>
      </section>

      {/* Popular Projects */}
      {sortedProjects.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16">
            <div className="mb-8 text-center">
              <h2 className="font-heading text-3xl font-bold tracking-tight">
                Popular Projects
              </h2>
              <p className="mt-2 text-muted-foreground">
                Discover what UH students are building right now.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <Button variant="outline" asChild>
                <Link href="/projects">View All Projects</Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
