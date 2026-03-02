import Link from "next/link"
import { auth } from "@/auth"
import { getProjects } from "@/lib/queries/projects"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectGrid } from "@/components/projects/project-grid"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const session = await auth()

  const page = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1
  const currentPage = isNaN(page) || page < 1 ? 1 : page

  const { projects, totalPages } = await getProjects({ page: currentPage })

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          Projects
        </h1>
        {session?.user && (
          <Button asChild>
            <Link href="/dashboard/repos">
              <Plus className="mr-2 size-4" />
              Post
            </Link>
          </Button>
        )}
      </div>

      {projects.length > 0 ? (
        <>
          <ProjectGrid>
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </ProjectGrid>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-4">
              {currentPage > 1 ? (
                <Button variant="outline" asChild>
                  <Link href={`/projects?page=${currentPage - 1}`}>
                    Previous
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Previous
                </Button>
              )}
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              {currentPage < totalPages ? (
                <Button variant="outline" asChild>
                  <Link href={`/projects?page=${currentPage + 1}`}>
                    Next
                  </Link>
                </Button>
              ) : (
                <Button variant="outline" disabled>
                  Next
                </Button>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <h3 className="font-heading text-lg font-semibold">
            No projects yet
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to post a project.
          </p>
          {session?.user && (
            <Button asChild className="mt-4">
              <Link href="/dashboard/repos">
                <Plus className="mr-2 size-4" />
                Post
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
