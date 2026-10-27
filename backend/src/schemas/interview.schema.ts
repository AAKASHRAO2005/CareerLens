import { z } from "zod";

export const interviewModeEnum = z.enum(["ONLINE", "IN_PERSON", "PHONE"]);

export const createInterviewSchema = z.object({
  applicationId: z
    .string()
    .trim()
    .min(1, "Job application ID is required.")
    .max(100, "Job application ID cannot exceed 100 characters."),
  roundName: z
    .string()
    .trim()
    .min(1, "Round name is required.")
    .max(100, "Round name cannot exceed 100 characters."),
  interviewDate: z
    .string()
    .trim()
    .min(1, "Interview date is required.")
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Interview date must be a valid ISO 8601 date string.",
    }),
  mode: interviewModeEnum.default("ONLINE"),
  notes: z
    .string()
    .max(2000, "Notes cannot exceed 2000 characters.")
    .optional(),
});

export const updateInterviewSchema = z.object({
  roundName: z
    .string()
    .trim()
    .min(1, "Round name is required.")
    .max(100, "Round name cannot exceed 100 characters.")
    .optional(),
  interviewDate: z
    .string()
    .trim()
    .min(1, "Interview date is required.")
    .refine((val) => !isNaN(new Date(val).getTime()), {
      message: "Interview date must be a valid ISO 8601 date string.",
    })
    .optional(),
  mode: interviewModeEnum.optional(),
  notes: z
    .string()
    .max(2000, "Notes cannot exceed 2000 characters.")
    .optional(),
});

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>;
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>;
