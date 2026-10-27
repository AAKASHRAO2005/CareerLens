import { z } from "zod";

export const interviewSchema = z.object({
  applicationId: z.string().min(1, "Job application is required"),
  roundName: z
    .string()
    .trim()
    .min(1, "Round name is required (e.g. Technical Round 1)")
    .max(100, "Round name cannot exceed 100 characters"),
  interviewDate: z.string().min(1, "Interview date is required"),
  mode: z.enum(["ONLINE", "IN_PERSON", "PHONE"]).default("ONLINE"),
  notes: z
    .string()
    .max(2000, "Notes cannot exceed 2000 characters")
    .optional()
    .default(""),
});

export type InterviewFormValues = z.infer<typeof interviewSchema>;
