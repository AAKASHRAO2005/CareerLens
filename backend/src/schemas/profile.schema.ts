import { z } from "zod";

export const patchProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Display name must not be empty.")
    .max(80, "Display name must not exceed 80 characters.")
    .optional(),
  skills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill must not be empty.")
        .max(50, "Skill name must not exceed 50 characters.")
    )
    .max(100, "Maximum of 100 skills allowed.")
    .optional(),
});

export type PatchProfileInput = z.infer<typeof patchProfileSchema>;
