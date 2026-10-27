import { describe, it, expect } from "vitest";
import { normalizeSkill } from "@/lib/formatters";

function calculateSkillMatch(profileSkills: string[], requiredSkills: string[]) {
  if (!requiredSkills.length) {
    return {
      hasRequiredSkills: false,
      matchedSkills: [],
      missingSkills: [],
      matchPercentage: 0,
    };
  }

  const normalizedProfile = new Set(profileSkills.map((s) => normalizeSkill(s)));
  
  // Deduplicate required skills by normalized form
  const seenNormalized = new Set<string>();
  const distinctRequired: string[] = [];
  for (const req of requiredSkills) {
    const norm = normalizeSkill(req);
    if (!norm || seenNormalized.has(norm)) continue;
    seenNormalized.add(norm);
    distinctRequired.push(req.trim());
  }

  const matched: string[] = [];
  const missing: string[] = [];

  for (const req of distinctRequired) {
    if (normalizedProfile.has(normalizeSkill(req))) {
      matched.push(req);
    } else {
      missing.push(req);
    }
  }

  const matchPercentage =
    distinctRequired.length > 0
      ? Math.round((matched.length / distinctRequired.length) * 100)
      : 0;

  return {
    hasRequiredSkills: true,
    matchedSkills: matched,
    missingSkills: missing,
    matchPercentage,
  };
}

describe("Deterministic Skill-Gap Analyzer Matching Logic", () => {
  it("matches identical skills regardless of casing and leading/trailing whitespace", () => {
    const profile = ["Python", "sql", "  React  "];
    const required = ["python", "SQL", "React"];

    const result = calculateSkillMatch(profile, required);
    expect(result.matchedSkills).toEqual(["python", "SQL", "React"]);
    expect(result.missingSkills).toEqual([]);
    expect(result.matchPercentage).toBe(100);
  });

  it("resolves documented aliases (e.g. postgres -> postgresql, js -> javascript)", () => {
    const profile = ["PostgreSQL", "JavaScript", "React"];
    const required = ["postgres", "js", "AWS"];

    const result = calculateSkillMatch(profile, required);
    expect(result.matchedSkills).toContain("postgres");
    expect(result.matchedSkills).toContain("js");
    expect(result.missingSkills).toContain("AWS");
    expect(result.matchPercentage).toBe(67);
  });

  it("handles empty required skills safely without dividing by zero", () => {
    const profile = ["Python", "SQL"];
    const required: string[] = [];

    const result = calculateSkillMatch(profile, required);
    expect(result.hasRequiredSkills).toBe(false);
    expect(result.matchPercentage).toBe(0);
    expect(result.matchedSkills).toEqual([]);
  });

  it("handles candidate with zero matching skills", () => {
    const profile = ["HTML", "CSS"];
    const required = ["Rust", "Kubernetes", "C++"];

    const result = calculateSkillMatch(profile, required);
    expect(result.matchedSkills).toEqual([]);
    expect(result.missingSkills).toEqual(["Rust", "Kubernetes", "C++"]);
    expect(result.matchPercentage).toBe(0);
  });

  it("deduplicates repeated requirements before percentage calculation", () => {
    const profile = ["Python"];
    const required = ["Python", "python", "Python  "];

    const result = calculateSkillMatch(profile, required);
    expect(result.matchedSkills.length).toBe(1);
    expect(result.matchPercentage).toBe(100);
  });
});
