import { ApplicationRepository } from "../repositories/applications.repo.js";
import { ProfileRepository } from "../repositories/dynamodb.repo.js";
import { AuthUser } from "../types/backend.types.js";
import { calculateSkillMatch, SkillMatchResult } from "../utils/skill-matcher.js";

export interface ApplicationSkillAnalysisResponse extends SkillMatchResult {
  applicationId: string;
  companyName: string;
  jobTitle: string;
}

export const SkillAnalysisService = {
  async analyzeApplicationSkills(
    user: AuthUser,
    applicationId: string
  ): Promise<ApplicationSkillAnalysisResponse | null> {
    // 1. Fetch application scoped strictly to authenticated user's partition key
    const application = await ApplicationRepository.getApplication(user.userId, applicationId);
    if (!application) {
      return null;
    }

    // 2. Fetch authenticated candidate's user profile to retrieve their registered skills
    const profile = await ProfileRepository.getProfile(user.userId);
    const candidateSkills = profile?.skills || [];

    // 3. Perform deterministic matching
    const match = calculateSkillMatch(candidateSkills, application.requiredSkills || []);

    return {
      applicationId: application.applicationId,
      companyName: application.companyName,
      jobTitle: application.jobTitle,
      ...match,
    };
  },
};
