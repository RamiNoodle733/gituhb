import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ProjectCard } from "@/components/projects/project-card"
import { Logo } from "@/components/ui/logo"
import { getFeaturedProjects } from "@/lib/queries/projects"
import { Github, ArrowRight } from "lucide-react"

export default async function HomePage() {
  const featuredProjects = await getFeaturedProjects()

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:64px_64px]" />
        <div className="container relative mx-auto flex flex-col items-center px-4 py-20 text-center md:py-28">
          <Logo size="lg" linked={false} className="mb-8 [&_span]:text-primary-foreground [&_div]:border-primary-foreground/30 [&_div]:bg-primary-foreground/10 [&_div]:text-primary-foreground" />
          <h1 className="font-display text-4xl uppercase tracking-tight sm:text-5xl md:text-7xl">
            The Official UH Student
            <br />
            Collaboration Platform
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-heading text-primary-foreground/80">
            Connect your GitHub. Find your team. Ship your project.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/signin">
                <Github className="mr-2 size-5" />
                Get Started with GitHub
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link href="/projects">Browse Projects</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="container mx-auto px-4 py-16">
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
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto flex flex-col items-center px-4 py-12 text-center md:py-16">
          <h2 className="font-heading text-2xl font-bold tracking-tight md:text-3xl">
            Ready to collaborate?
          </h2>
          <p className="mt-2 text-primary-foreground/80">
            Join UH students building real projects with real teams.
          </p>
          <Button size="lg" variant="secondary" asChild className="mt-6">
            <Link href="/auth/signin">
              Get Started
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
