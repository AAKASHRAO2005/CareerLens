import { z } from "zod";

export const applicationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required")
    .max(120, "Company name cannot exceed 120 characters"),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required")
    .max(120, "Job title cannot exceed 120 characters"),
  jobDescription: z
    .string()
    .max(20000, "Job description cannot exceed 20,000 characters")
    .optional(),
  status: z
    .enum([
      "SAVED",
      "APPLIED",
      "ONLINE_ASSESSMENT",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
      "WITHDRAWN",
    ]),
  applicationDate: z.string().optional(),
  notes: z
    .string()
    .max(5000, "Notes cannot exceed 5000 characters")
    .optional(),
  requiredSkills: z.array(z.string().trim()).optional(),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
