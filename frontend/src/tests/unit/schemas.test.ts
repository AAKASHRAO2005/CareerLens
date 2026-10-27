import { describe, it, expect } from "vitest";
import { applicationSchema } from "@/schemas/application.schema";
import { profileSchema } from "@/schemas/profile.schema";
import { interviewSchema } from "@/schemas/interview.schema";

describe("Validation Schemas", () => {
  describe("Application Schema", () => {
    it("validates valid application payload", () => {
      const valid = {
        companyName: "Acme Corp",
        jobTitle: "Software Engineer",
        status: "APPLIED",
        jobDescription: "Exciting opportunity",
        requiredSkills: ["TypeScript", "AWS"],
      };
      const result = applicationSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty company name", () => {
      const invalid = {
        companyName: "",
        jobTitle: "Software Engineer",
      };
      const result = applicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("rejects invalid status", () => {
      const invalid = {
        companyName: "Acme Corp",
        jobTitle: "Software Engineer",
        status: "INVALID_STATUS",
      };
      const result = applicationSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Profile Schema", () => {
    it("validates valid profile data", () => {
      const valid = {
        displayName: "Akash Sharma",
        skills: ["React", "Node.js"],
      };
      const result = profileSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty display name", () => {
      const invalid = {
        displayName: "   ",
        skills: [],
      };
      const result = profileSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("Interview Schema", () => {
    it("validates valid interview input", () => {
      const valid = {
        applicationId: "app-123",
        roundName: "Technical Round 1",
        interviewDate: "2026-11-01T10:00:00.000Z",
        mode: "ONLINE",
      };
      const result = interviewSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("requires round name and date", () => {
      const invalid = {
        applicationId: "app-123",
        roundName: "",
        interviewDate: "",
      };
      const result = interviewSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });
});
