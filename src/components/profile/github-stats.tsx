import { Github, Star, BookMarked, Users, ExternalLink } from "lucide-react"

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  SCSS: "#c6538c",
  Vue: "#41b883",
  Svelte: "#ff3e00",
  Lua: "#000080",
  R: "#198CE7",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Zig: "#ec915c",
}

type GitHubStatsProps = {
  username: string
  profileUrl: string | null
  reposCount: number | null
  totalStars: number | null
  followers: number | null
  topLanguages: unknown
  bio: string | null
}

export function GitHubStats({
  username,
  profileUrl,
  reposCount,
  totalStars,
  followers,
  topLanguages,
  bio,
}: GitHubStatsProps) {
  const languages = Array.isArray(topLanguages)
    ? (topLanguages as string[]).slice(0, 5)
    : []

  const url = profileUrl ?? `https://github.com/${username}`

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2">
        <Github className="size-5" />
        <CardTitle className="font-heading text-lg">GitHub</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {bio && (
          <p className="text-sm text-muted-foreground">{bio}</p>
        )}

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{reposCount ?? 0}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <BookMarked className="size-3" />
              Repos
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">{totalStars ?? 0}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Star className="size-3" />
              Stars
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold">{followers ?? 0}</p>
            <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Users className="size-3" />
              Followers
            </p>
          </div>
        </div>

        {languages.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Top Languages
            </p>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="gap-1 font-mono text-xs"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{
                      backgroundColor: LANGUAGE_COLORS[lang] ?? "#6e7681",
                    }}
                  />
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="mr-2 size-3.5" />
            View on GitHub
          </a>
        </Button>
      </CardContent>
    </Card>
  )
}
