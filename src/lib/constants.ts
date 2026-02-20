export const UH_EMAIL_DOMAINS = ["uh.edu", "cougarnet.uh.edu"] as const

export const TECH_STACK_OPTIONS = [
  "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "Go", "Rust",
  "React", "Next.js", "Vue", "Angular", "Svelte",
  "Node.js", "Express", "Django", "Flask", "Spring Boot",
  "PostgreSQL", "MySQL", "MongoDB", "Redis", "Firebase",
  "AWS", "GCP", "Azure", "Vercel",
  "Docker", "Kubernetes",
  "TensorFlow", "PyTorch", "OpenAI",
  "React Native", "Flutter", "Swift", "Kotlin",
  "Tailwind CSS", "GraphQL", "REST API",
] as const

export const TAG_OPTIONS = [
  "Web App", "Mobile App", "Desktop App", "CLI Tool",
  "AI/ML", "Data Science", "DevOps", "Cybersecurity",
  "Game Dev", "Blockchain", "IoT", "AR/VR",
  "Open Source", "Hackathon", "Research", "Course Project",
  "Startup", "Non-Profit",
] as const

export const TIME_COMMITMENT_LABELS: Record<string, string> = {
  LESS_THAN_5: "< 5 hrs/week",
  FIVE_TO_TEN: "5-10 hrs/week",
  TEN_TO_TWENTY: "10-20 hrs/week",
  TWENTY_PLUS: "20+ hrs/week",
}
