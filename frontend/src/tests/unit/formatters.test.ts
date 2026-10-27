import { describe, it, expect } from "vitest";
import {
  formatDate,
  formatDateTime,
  formatFileSize,
  normalizeSkill,
  STATUS_MAP,
} from "@/lib/formatters";

describe("Formatters Utility", () => {
  it("formats dates gracefully", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("2026-10-27T10:00:00.000Z")).toContain("2026");
    expect(formatDateTime("2026-10-27T10:00:00.000Z")).toContain("2026");
  });

  it("formats file sizes correctly", () => {
    expect(formatFileSize(0)).toBe("0 B");
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(2048)).toBe("2.0 KB");
    expect(formatFileSize(1048576 * 3)).toBe("3.00 MB");
  });

  it("normalizes skills deterministically and maps aliases", () => {
    expect(normalizeSkill("  Python  ")).toBe("python");
    expect(normalizeSkill("POSTGRES")).toBe("postgresql");
    expect(normalizeSkill("JS")).toBe("javascript");
    expect(normalizeSkill("reactjs")).toBe("react");
    expect(normalizeSkill("AWS")).toBe("amazon web services");
  });

  it("has complete status mappings for all required statuses", () => {
    const statuses = [
      "SAVED",
      "APPLIED",
      "ONLINE_ASSESSMENT",
      "INTERVIEW",
      "OFFER",
      "REJECTED",
      "WITHDRAWN",
    ] as const;

    for (const status of statuses) {
      expect(STATUS_MAP[status]).toBeDefined();
      expect(STATUS_MAP[status].label).toBeTruthy();
      expect(STATUS_MAP[status].colorClass).toBeTruthy();
    }
  });
});
