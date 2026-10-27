export interface SkillAnalysisResult {
  applicationId: string;
  companyName: string;
  jobTitle: string;
  hasRequiredSkills: boolean;
  matchPercentage: number;
  matchedSkills: string[];
  missingSkills: string[];
  disclaimer: string;
}
