import { apiClient } from "@/lib/api-client";
import { SkillAnalysisResult } from "@/types/skill-analysis";

export interface SkillAnalysisApiResponse {
  analysis: SkillAnalysisResult;
}

/**
 * Perform rule-based skill gap analysis for a target job application
 * against the authenticated candidate's profile skills.
 */
export async function fetchSkillAnalysis(
  applicationId: string
): Promise<SkillAnalysisResult> {
  const response = await apiClient.post<SkillAnalysisApiResponse>(
    `/v1/applications/${encodeURIComponent(applicationId)}/skill-analysis`,
    {}
  );
  return response.analysis;
}
