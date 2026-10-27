import { ProfileRepository } from "../repositories/dynamodb.repo.js";
import { AuthUser, UserProfileRecord } from "../types/backend.types.js";
import { PatchProfileInput } from "../schemas/profile.schema.js";

export const ProfileService = {
  async getOrCreateProfile(user: AuthUser): Promise<UserProfileRecord> {
    const existing = await ProfileRepository.getProfile(user.userId);
    if (existing) {
      return existing;
    }

    const now = new Date().toISOString();
    const newProfile: UserProfileRecord = {
      PK: `USER#${user.userId}`,
      SK: "PROFILE",
      entityType: "PROFILE",
      displayName: user.email.split("@")[0] || "Student User",
      email: user.email,
      skills: [],
      createdAt: now,
      updatedAt: now,
    };

    await ProfileRepository.putProfile(newProfile);
    return newProfile;
  },

  async updateProfile(user: AuthUser, input: PatchProfileInput): Promise<UserProfileRecord> {
    // Ensure profile exists first
    await this.getOrCreateProfile(user);

    const now = new Date().toISOString();
    const updates: { displayName?: string; skills?: string[] } = {};

    if (input.displayName !== undefined) {
      updates.displayName = input.displayName.trim();
    }

    if (input.skills !== undefined) {
      // Deduplicate skills while preserving case
      const seen = new Set<string>();
      const cleanSkills: string[] = [];
      for (const s of input.skills) {
        const lower = s.trim().toLowerCase();
        if (lower && !seen.has(lower)) {
          seen.add(lower);
          cleanSkills.push(s.trim());
        }
      }
      updates.skills = cleanSkills;
    }

    const updated = await ProfileRepository.updateProfile(user.userId, updates, now);
    if (!updated) {
      throw new Error("Failed to update profile record in DynamoDB.");
    }

    return updated;
  },
};
