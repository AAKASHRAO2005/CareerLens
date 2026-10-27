import { z } from "zod";

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(80, "Display name cannot exceed 80 characters"),
  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill name cannot be empty")
        .max(50, "Skill name cannot exceed 50 characters")
    )
    .max(100, "Maximum 100 skills allowed")
    .default([]),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
