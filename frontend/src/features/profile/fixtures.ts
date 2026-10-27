import { UserProfile } from "@/types/profile";

/**
 * Isolated mock fixture for initial UI development (Phase 2).
 * Clearly marked as mock data — will be replaced by API client in Phase 3.
 */
export const INITIAL_MOCK_PROFILE: UserProfile = {
  displayName: "Akash Sharma",
  email: "akash.sharma@student.university.edu",
  skills: [
    "Python",
    "SQL",
    "TypeScript",
    "React",
    "Node.js",
    "Git",
    "Data Structures",
    "PostgreSQL",
    "Docker",
    "REST APIs",
  ],
  createdAt: "2026-10-20T09:00:00.000Z",
  updatedAt: "2026-10-27T10:00:00.000Z",
};
