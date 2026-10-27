import { JobApplication } from "@/types/application";

/**
 * Isolated mock fixture for initial UI development (Phase 2).
 * Clearly marked as mock data — will be replaced by API client in Phase 4.
 */
export const INITIAL_MOCK_APPLICATIONS: JobApplication[] = [
  {
    applicationId: "app-uuid-001",
    companyName: "Nexus Cloud Systems",
    jobTitle: "Junior Cloud Infrastructure Engineer",
    jobDescription:
      "Looking for a motivated cloud engineer with strong foundations in AWS, TypeScript, Docker, and Linux. You will help build and maintain serverless microservices and automated CI/CD deployment pipelines.",
    requiredSkills: ["AWS", "TypeScript", "Docker", "Node.js", "CI/CD", "Linux"],
    status: "INTERVIEW",
    applicationDate: "2026-10-15",
    notes: "Passed technical phone screening. Round 2 architecture interview scheduled for Nov 3.",
    createdAt: "2026-10-15T10:30:00.000Z",
    updatedAt: "2026-10-25T14:20:00.000Z",
  },
  {
    applicationId: "app-uuid-002",
    companyName: "Apex Data Intelligence",
    jobTitle: "Associate Data Engineer",
    jobDescription:
      "Join our data team to design, build, and optimize scalable ETL workflows. Responsibilities include data ingestion with Python, relational querying in PostgreSQL, data warehouse modeling, and building pipeline quality validations.",
    requiredSkills: ["Python", "SQL", "Postgres", "ETL", "Data Modeling", "Pandas"],
    status: "ONLINE_ASSESSMENT",
    applicationDate: "2026-10-18",
    notes: "HackerRank online assessment link received. Due by Oct 30.",
    createdAt: "2026-10-18T08:15:00.000Z",
    updatedAt: "2026-10-22T11:00:00.000Z",
  },
  {
    applicationId: "app-uuid-003",
    companyName: "FinTech Velocity",
    jobTitle: "Frontend Developer (Graduate Track)",
    jobDescription:
      "Seeking a front-end specialist skilled in modern React, Next.js, and TypeScript. You will build user-facing financial dashboards with high responsiveness, clean UI component architectures, and comprehensive unit tests.",
    requiredSkills: ["React", "TypeScript", "Next.js", "Tailwind CSS", "REST APIs", "Jest"],
    status: "OFFER",
    applicationDate: "2026-10-02",
    notes: "Offer letter received! Reviewing compensation package and start date.",
    createdAt: "2026-10-02T12:00:00.000Z",
    updatedAt: "2026-10-26T16:45:00.000Z",
  },
  {
    applicationId: "app-uuid-004",
    companyName: "CyberPulse Security",
    jobTitle: "Security Operations Analyst Intern",
    jobDescription:
      "Assist in monitoring security event pipelines, configuring alerts, and analyzing log patterns. Knowledge of Python scripting, Linux networking, and AWS security fundamentals is preferred.",
    requiredSkills: ["Python", "Linux", "Networking", "AWS", "Security Auditing"],
    status: "APPLIED",
    applicationDate: "2026-10-24",
    notes: "Submitted via campus recruitment portal. Awaiting initial screening results.",
    createdAt: "2026-10-24T09:00:00.000Z",
    updatedAt: "2026-10-24T09:00:00.000Z",
  },
  {
    applicationId: "app-uuid-005",
    companyName: "Quantico Global",
    jobTitle: "Backend Systems Trainee",
    jobDescription:
      "Build high-throughput transactional backends in Go or Node.js. Experience with Redis caching, SQL databases, and event messaging queues is required.",
    requiredSkills: ["Node.js", "SQL", "Redis", "Kafka", "Docker"],
    status: "SAVED",
    applicationDate: "2026-10-26",
    notes: "Preparing updated resume targeting distributed systems before applying.",
    createdAt: "2026-10-26T15:00:00.000Z",
    updatedAt: "2026-10-26T15:00:00.000Z",
  },
  {
    applicationId: "app-uuid-006",
    companyName: "Hyperion Labs",
    jobTitle: "Machine Learning Intern",
    jobDescription:
      "Deep learning model prototyping with PyTorch and Python. Requires solid statistical mathematics, computer vision algorithms, and GPU containerization experience.",
    requiredSkills: ["Python", "PyTorch", "Computer Vision", "Docker", "Linear Algebra"],
    status: "REJECTED",
    applicationDate: "2026-09-28",
    notes: "Role required prior graduate publication experience.",
    createdAt: "2026-09-28T10:00:00.000Z",
    updatedAt: "2026-10-10T14:30:00.000Z",
  },
];
