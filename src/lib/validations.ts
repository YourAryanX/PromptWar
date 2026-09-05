import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  skills: z.array(z.string()).max(30, "Too many skills selected"),
  interests: z.string().max(500, "Interests description is too long"),
})

export const projectSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title is too long"),
  description: z.string().min(1, "Description is required").max(1000, "Description is too long"),
  techStack: z.array(z.string()).max(20, "Too many technologies selected"),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']),
  wowFactor: z.string().max(500, "Wow factor is too long"),
})
