import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/project-card"
import { getFeaturedProjects } from "@/lib/queries/projects"
import { Search, Users, Rocket } from "lucide-react"

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects()

  return (
    <div>
      {/* Hero */}
      <section className="border-b bg-gradient-to-b from-background to-muted/50">
        <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center md:py-32">
          <h1 className="font-display text-5xl uppercase tracking-tight md:text-7xl">
            Find Your Team.
            <br />
            <span className="text-primary">Ship Your Project.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground font-heading">
            The collaboration platform for University of Houston students.
            Post projects, discover teammates, and build something great together.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/projects">Browse Projects</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/projects/new">Post a Project</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <div className="mb-8 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              Featured Projects
            </h2>
            <p className="mt-2 text-muted-foreground">
              Discover what UH students are building right now.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" asChild>
              <Link href="/projects">View All Projects</Link>
            </Button>
          </div>
        </section>
      )}

      {/* How It Works */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="mb-12 text-center">
            <h2 className="font-heading text-3xl font-bold tracking-tight">
              How It Works
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">1. Post</h3>
              <p className="text-sm text-muted-foreground">
                Share your project idea with roles you need filled, tech stack, and time commitment.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Search className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">2. Discover</h3>
              <p className="text-sm text-muted-foreground">
                Browse projects by technology, tags, or time commitment. Find exactly what you&apos;re looking for.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10">
                <Users className="size-6 text-primary" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold">3. Build</h3>
              <p className="text-sm text-muted-foreground">
                Apply to join a team, get accepted, and start collaborating with fellow Coogs.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
