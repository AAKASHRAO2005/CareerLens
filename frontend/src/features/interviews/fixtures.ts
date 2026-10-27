import { Interview } from "@/types/interview";

/**
 * Isolated mock fixture for initial UI development (Phase 2).
 * Clearly marked as mock data — will be replaced by API client in Phase 6.
 */
export const INITIAL_MOCK_INTERVIEWS: Interview[] = [
  {
    interviewId: "int-uuid-001",
    applicationId: "app-uuid-001",
    roundName: "Technical Architecture & Systems Round",
    interviewDate: "2026-11-03T14:30:00.000Z",
    mode: "ONLINE",
    notes: "Prepare AWS Serverless concepts, DynamoDB single-table schema design, and Docker container lifecycle.",
    createdAt: "2026-10-25T14:20:00.000Z",
  },
  {
    interviewId: "int-uuid-002",
    applicationId: "app-uuid-002",
    roundName: "Live Coding & SQL Optimization Test",
    interviewDate: "2026-11-06T10:00:00.000Z",
    mode: "ONLINE",
    notes: "Review PostgreSQL window functions, indexing strategies, and Python multiprocessing pipelines.",
    createdAt: "2026-10-22T11:00:00.000Z",
  },
  {
    interviewId: "int-uuid-003",
    applicationId: "app-uuid-003",
    roundName: "Final HR & Offer Discussion",
    interviewDate: "2026-10-25T16:00:00.000Z",
    mode: "ONLINE",
    notes: "Completed. Received formal offer letter the following morning.",
    createdAt: "2026-10-20T10:00:00.000Z",
  },
];
