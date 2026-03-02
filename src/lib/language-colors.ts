export const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C++": "#f34b7d",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#dea584",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  Dart: "#00B4AB",
  Scala: "#c22d40",
  Lua: "#000080",
  R: "#198CE7",
  Julia: "#a270ba",
  Haskell: "#5e5086",
  Elixir: "#6e4a7e",
  Clojure: "#db5855",
  Perl: "#0298c3",
  Vue: "#41b883",
  SCSS: "#c6538c",
  Objective: "#438eff",
}

export function getLanguageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? "#6e7681"
}
