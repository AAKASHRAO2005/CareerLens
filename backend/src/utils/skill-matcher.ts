/**
 * Deterministic skill normalization rule as defined in Document 3.
 */
export function normalizeSkill(skill: string): string {
  const ALIAS_MAP: Record<string, string> = {
    postgres: "postgresql",
    js: "javascript",
    ts: "typescript",
    reactjs: "react",
    nextjs: "next.js",
    py: "python",
    aws: "amazon web services",
  };

  const cleaned = skill.trim().toLowerCase();
  return ALIAS_MAP[cleaned] || cleaned;
}

export interface SkillMatchResult {
  hasRequiredSkills: boolean;
  matchedSkills: string[];
  missingSkills: string[];
  matchPercentage: number;
  disclaimer: string;
}

export const SKILL_ANALYSIS_DISCLAIMER =
  "This analysis is rule-based and intended for self-assessment only. It is not an automated hiring prediction or recruitment decision.";

export function calculateSkillMatch(
  profileSkills: string[],
  requiredSkills: string[]
): SkillMatchResult {
  if (!requiredSkills || !requiredSkills.length) {
    return {
      hasRequiredSkills: false,
      matchedSkills: [],
      missingSkills: [],
      matchPercentage: 0,
      disclaimer: SKILL_ANALYSIS_DISCLAIMER,
    };
  }

  const normalizedProfile = new Set(
    profileSkills.map((s) => normalizeSkill(s)).filter((s) => s.length > 0)
  );

  // Deduplicate required skills by normalized form while preserving original casing
  const seenNormalized = new Set<string>();
  const distinctRequired: string[] = [];

  for (const req of requiredSkills) {
    const trimmed = req.trim();
    if (!trimmed) continue;
    const norm = normalizeSkill(trimmed);
    if (!norm || seenNormalized.has(norm)) continue;
    seenNormalized.add(norm);
    distinctRequired.push(trimmed);
  }

  if (distinctRequired.length === 0) {
    return {
      hasRequiredSkills: false,
      matchedSkills: [],
      missingSkills: [],
      matchPercentage: 0,
      disclaimer: SKILL_ANALYSIS_DISCLAIMER,
    };
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

  const matchPercentage = Math.round((matched.length / distinctRequired.length) * 100);

  return {
    hasRequiredSkills: true,
    matchedSkills: matched,
    missingSkills: missing,
    matchPercentage,
    disclaimer: SKILL_ANALYSIS_DISCLAIMER,
  };
}
