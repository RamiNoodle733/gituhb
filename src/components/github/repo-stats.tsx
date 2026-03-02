import { Star, GitFork, CircleDot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getLanguageColor } from "@/lib/language-colors"

interface RepoStatsProps {
  stars: number | null
  forks: number | null
  openIssues: number | null
  languages: Record<string, number> | null
}

export function RepoStats({ stars, forks, openIssues, languages }: RepoStatsProps) {
  const hasStats = stars != null || forks != null || openIssues != null

  if (!hasStats && !languages) return null

  const totalBytes = languages
    ? Object.values(languages).reduce((a, b) => a + b, 0)
    : 0

  const languageEntries = languages
    ? Object.entries(languages)
        .sort(([, a], [, b]) => b - a)
        .map(([name, bytes]) => ({
          name,
          percentage: Math.round((bytes / totalBytes) * 1000) / 10,
          color: getLanguageColor(name),
        }))
    : []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Repository</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasStats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            {stars != null && (
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <Star className="size-3.5" />
                </div>
                <p className="text-lg font-semibold">{stars}</p>
                <p className="text-[10px] text-muted-foreground">Stars</p>
              </div>
            )}
            {forks != null && (
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <GitFork className="size-3.5" />
                </div>
                <p className="text-lg font-semibold">{forks}</p>
                <p className="text-[10px] text-muted-foreground">Forks</p>
              </div>
            )}
            {openIssues != null && (
              <div>
                <div className="flex items-center justify-center gap-1 text-muted-foreground">
                  <CircleDot className="size-3.5" />
                </div>
                <p className="text-lg font-semibold">{openIssues}</p>
                <p className="text-[10px] text-muted-foreground">Issues</p>
              </div>
            )}
          </div>
        )}

        {languageEntries.length > 0 && (
          <div>
            <div className="mb-2 flex h-2 overflow-hidden rounded-full">
              {languageEntries.map((lang) => (
                <div
                  key={lang.name}
                  className="h-full"
                  style={{
                    width: `${lang.percentage}%`,
                    backgroundColor: lang.color,
                  }}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {languageEntries.slice(0, 6).map((lang) => (
                <div key={lang.name} className="flex items-center gap-1 text-xs">
                  <span
                    className="inline-block size-2 rounded-full"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span>{lang.name}</span>
                  <span className="text-muted-foreground">{lang.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
