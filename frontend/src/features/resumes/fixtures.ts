import { ResumeMetadata } from "@/types/resume";

/**
 * Isolated mock fixture for initial UI development (Phase 2).
 * Clearly marked as mock data — will be replaced by S3/DynamoDB in Phase 7.
 */
export const INITIAL_MOCK_RESUMES: ResumeMetadata[] = [
  {
    resumeId: "res-uuid-001",
    fileName: "Akash_Sharma_FullStack_2026.pdf",
    contentType: "application/pdf",
    sizeBytes: 245760, // 240 KB
    status: "READY",
    createdAt: "2026-10-20T11:00:00.000Z",
  },
  {
    resumeId: "res-uuid-002",
    fileName: "Akash_Sharma_DataEngineering_v2.pdf",
    contentType: "application/pdf",
    sizeBytes: 312000, // 304 KB
    status: "READY",
    createdAt: "2026-10-24T16:30:00.000Z",
  },
];
