import { z } from "zod";

export const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const uploadIntentSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1, "File name is required.")
    .max(255, "File name cannot exceed 255 characters.")
    .refine((val) => val.toLowerCase().endsWith(".pdf"), {
      message: "Only PDF documents (.pdf) are permitted.",
    }),
  contentType: z.literal("application/pdf", {
    errorMap: () => ({ message: "Only 'application/pdf' MIME type is permitted." }),
  }),
  sizeBytes: z
    .number()
    .int("File size must be an integer in bytes.")
    .min(1, "File cannot be empty (0 bytes).")
    .max(MAX_RESUME_SIZE_BYTES, "Resume file size exceeds maximum 5 MB limit (5,242,880 bytes)."),
});

export type UploadIntentInput = z.infer<typeof uploadIntentSchema>;
