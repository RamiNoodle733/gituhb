import { fetchRepoReadme } from "@/lib/github"

interface GitHubReadmeProps {
  owner: string
  repo: string
  token?: string | null
}

export async function GitHubReadme({ owner, repo, token }: GitHubReadmeProps) {
  let html = ""
  try {
    html = await fetchRepoReadme(owner, repo, token)
  } catch {
    return null
  }

  if (!html) return null

  return (
    <section>
      <h2 className="font-heading mb-4 text-xl font-semibold">README</h2>
      <div
        className="prose prose-sm dark:prose-invert max-w-none rounded-lg border p-6 overflow-hidden"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </section>
  )
}
