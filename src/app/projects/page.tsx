import Link from "next/link"
import { auth } from "@/auth"
import { getProjects } from "@/lib/queries/projects"
import { ProjectCard } from "@/components/projects/project-card"
import { ProjectFilters } from "@/components/projects/project-filters"
import { ProjectGrid } from "@/components/projects/project-grid"
import { Button } from "@/components/ui/button"
import { Plus, FolderSearch } from "lucide-react"

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const session = await auth()

  const search = typeof sp.search === "string" ? sp.search : undefined
  const techStack = typeof sp.techStack === "string" ? sp.techStack : undefined
  const timeCommitment =
    typeof sp.timeCommitment === "string" ? sp.timeCommitment : undefined
  const status = typeof sp.status === "string" ? sp.status : undefined
  const page = typeof sp.page === "string" ? parseInt(sp.page, 10) : 1
  const currentPage = isNaN(page) || page < 1 ? 1 : page

  const { projects, totalCount, totalPages } = await getProjects({
    search,
    techStack,
    timeCommitment,
    status,
    page: currentPage,
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight">
            Explore Projects
          </h1>
          <p className="mt-1 text-muted-foreground">
            Find a project that matches your skills and interests
          </p>
        </div>
        {session?.user && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus />
              Post a Project
            </Link>
          </Button>
        )}
      </div>

      {/* Main layout */}
      <div className="flex gap-8">
        {/* Sidebar filters - hidden on mobile */}
        <aside className="hidden w-64 shrink-0 md:block">
          <ProjectFilters />
        </aside>

        {/* Project listing */}
        <div className="flex-1">
          {/* Result count */}
          <p className="mb-4 text-sm text-muted-foreground">
            {totalCount} {totalCount === 1 ? "project" : "projects"} found
          </p>

          {projects.length > 0 ? (
            <>
              <ProjectGrid>
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </ProjectGrid>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  {currentPage > 1 ? (
                    <Button variant="outline" asChild>
                      <Link
                        href={{
                          pathname: "/projects",
                          query: {
                            ...Object.fromEntries(
                              Object.entries({
                                search,
                                techStack,
                                timeCommitment,
                                status,
                              }).filter(([, v]) => v !== undefined)
                            ),
                            page: currentPage - 1,
                          },
                        }}
                      >
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
                      <Link
                        href={{
                          pathname: "/projects",
                          query: {
                            ...Object.fromEntries(
                              Object.entries({
                                search,
                                techStack,
                                timeCommitment,
                                status,
                              }).filter(([, v]) => v !== undefined)
                            ),
                            page: currentPage + 1,
                          },
                        }}
                      >
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
            /* Empty state */
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
              <FolderSearch className="mb-4 size-12 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold">
                No projects found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your filters or create a new project.
              </p>
              {session?.user && (
                <Button asChild className="mt-4">
                  <Link href="/projects/new">
                    <Plus />
                    Post a Project
                  </Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
