import { z } from "zod";

export const applicationStatusEnum = z.enum([
  "SAVED",
  "APPLIED",
  "ONLINE_ASSESSMENT",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "WITHDRAWN",
]);

export const createApplicationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required.")
    .max(120, "Company name cannot exceed 120 characters."),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required.")
    .max(120, "Job title cannot exceed 120 characters."),
  jobDescription: z
    .string()
    .max(20000, "Job description cannot exceed 20,000 characters.")
    .optional(),
  requiredSkills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill name must not be empty.")
        .max(50, "Skill name cannot exceed 50 characters.")
    )
    .max(50, "Maximum of 50 required skills.")
    .optional()
    .default([]),
  status: applicationStatusEnum.default("APPLIED"),
  applicationDate: z.string().optional(),
  notes: z
    .string()
    .max(5000, "Notes cannot exceed 5,000 characters.")
    .optional(),
});

export const updateApplicationSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(1, "Company name is required.")
    .max(120, "Company name cannot exceed 120 characters.")
    .optional(),
  jobTitle: z
    .string()
    .trim()
    .min(1, "Job title is required.")
    .max(120, "Job title cannot exceed 120 characters.")
    .optional(),
  jobDescription: z
    .string()
    .max(20000, "Job description cannot exceed 20,000 characters.")
    .optional(),
  requiredSkills: z
    .array(
      z
        .string()
        .trim()
        .min(1, "Skill name must not be empty.")
        .max(50, "Skill name cannot exceed 50 characters.")
    )
    .max(50, "Maximum of 50 required skills.")
    .optional(),
  status: applicationStatusEnum.optional(),
  applicationDate: z.string().optional(),
  notes: z
    .string()
    .max(5000, "Notes cannot exceed 5,000 characters.")
    .optional(),
});

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>;
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>;
