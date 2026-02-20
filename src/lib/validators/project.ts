import { z } from "zod"

export const createProjectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(500),
  longDescription: z.string().max(5000).optional().or(z.literal("")),
  githubRepoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  timeCommitment: z.enum(["LESS_THAN_5", "FIVE_TO_TEN", "TEN_TO_TWENTY", "TWENTY_PLUS"]),
  techStack: z.array(z.string()).min(1, "Add at least one technology"),
  tags: z.array(z.string()),
  maxMembers: z.number().int().min(1).optional(),
  roles: z.array(z.object({
    title: z.string().min(1, "Role title is required"),
    description: z.string().optional().or(z.literal("")),
    count: z.number().int().min(1),
  })).min(1, "Add at least one role"),
  status: z.enum(["ACTIVE", "PAUSED", "COMPLETED", "ARCHIVED"]).optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const applicationSchema = z.object({
  roleId: z.string().min(1, "Please select a role"),
  message: z.string().min(20, "Your pitch must be at least 20 characters").max(2000),
})

export type ApplicationInput = z.infer<typeof applicationSchema>
