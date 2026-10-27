"use client";

import React, { createContext, useContext, useState } from "react";
import { JobApplication, CreateApplicationInput, UpdateApplicationInput } from "@/types/application";
import { UserProfile, UpdateProfileInput } from "@/types/profile";
import { Interview, CreateInterviewInput, UpdateInterviewInput } from "@/types/interview";
import { ResumeMetadata } from "@/types/resume";
import { INITIAL_MOCK_PROFILE } from "./profile/fixtures";
import { INITIAL_MOCK_APPLICATIONS } from "./applications/fixtures";
import { INITIAL_MOCK_INTERVIEWS } from "./interviews/fixtures";
import { INITIAL_MOCK_RESUMES } from "./resumes/fixtures";

interface MockDataContextType {
  profile: UserProfile;
  updateProfile: (input: UpdateProfileInput) => void;
  addSkill: (skill: string) => boolean;
  removeSkill: (skill: string) => void;

  applications: JobApplication[];
  getApplication: (id: string) => JobApplication | undefined;
  addApplication: (input: CreateApplicationInput) => JobApplication;
  updateApplication: (id: string, input: UpdateApplicationInput) => void;
  deleteApplication: (id: string) => void;

  interviews: Interview[];
  getInterviewsByApplication: (appId: string) => Interview[];
  addInterview: (input: CreateInterviewInput) => Interview;
  updateInterview: (id: string, input: UpdateInterviewInput) => void;
  deleteInterview: (id: string) => void;

  resumes: ResumeMetadata[];
  addResume: (file: { name: string; size: number; type: string }) => ResumeMetadata;
  deleteResume: (id: string) => void;
}

const MockDataContext = createContext<MockDataContextType | null>(null);

export const MockDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile>(INITIAL_MOCK_PROFILE);
  const [applications, setApplications] = useState<JobApplication[]>(INITIAL_MOCK_APPLICATIONS);
  const [interviews, setInterviews] = useState<Interview[]>(INITIAL_MOCK_INTERVIEWS);
  const [resumes, setResumes] = useState<ResumeMetadata[]>(INITIAL_MOCK_RESUMES);

  // Profile operations
  const updateProfile = (input: UpdateProfileInput) => {
    setProfile((prev) => ({
      ...prev,
      displayName: input.displayName ?? prev.displayName,
      skills: input.skills ?? prev.skills,
      updatedAt: new Date().toISOString(),
    }));
  };

  const addSkill = (skillName: string): boolean => {
    const trimmed = skillName.trim();
    if (!trimmed) return false;
    if (profile.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      return false; // Avoid duplicates
    }
    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, trimmed],
      updatedAt: new Date().toISOString(),
    }));
    return true;
  };

  const removeSkill = (skillToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter(
        (s) => s.toLowerCase() !== skillToRemove.toLowerCase()
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Applications operations
  const getApplication = (id: string) => {
    return applications.find((app) => app.applicationId === id);
  };

  const addApplication = (input: CreateApplicationInput): JobApplication => {
    const newApp: JobApplication = {
      applicationId: `app-uuid-${Date.now().toString(36)}`,
      companyName: input.companyName,
      jobTitle: input.jobTitle,
      jobDescription: input.jobDescription || "",
      requiredSkills: input.requiredSkills || [],
      status: input.status || "APPLIED",
      applicationDate: input.applicationDate || new Date().toISOString().split("T")[0],
      notes: input.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setApplications((prev) => [newApp, ...prev]);
    return newApp;
  };

  const updateApplication = (id: string, input: UpdateApplicationInput) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.applicationId !== id) return app;
        return {
          ...app,
          companyName: input.companyName ?? app.companyName,
          jobTitle: input.jobTitle ?? app.jobTitle,
          jobDescription: input.jobDescription ?? app.jobDescription,
          requiredSkills: input.requiredSkills ?? app.requiredSkills,
          status: input.status ?? app.status,
          applicationDate: input.applicationDate ?? app.applicationDate,
          notes: input.notes ?? app.notes,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  const deleteApplication = (id: string) => {
    setApplications((prev) => prev.filter((app) => app.applicationId !== id));
    // Cascade cleanup: remove linked interviews as planned
    setInterviews((prev) => prev.filter((int) => int.applicationId !== id));
  };

  // Interviews operations
  const getInterviewsByApplication = (appId: string) => {
    return interviews.filter((int) => int.applicationId === appId);
  };

  const addInterview = (input: CreateInterviewInput): Interview => {
    const newInt: Interview = {
      interviewId: `int-uuid-${Date.now().toString(36)}`,
      applicationId: input.applicationId,
      roundName: input.roundName,
      interviewDate: input.interviewDate,
      mode: input.mode,
      notes: input.notes || "",
      createdAt: new Date().toISOString(),
    };
    setInterviews((prev) => [...prev, newInt]);
    return newInt;
  };

  const updateInterview = (id: string, input: UpdateInterviewInput) => {
    setInterviews((prev) =>
      prev.map((int) => {
        if (int.interviewId !== id) return int;
        return {
          ...int,
          roundName: input.roundName ?? int.roundName,
          interviewDate: input.interviewDate ?? int.interviewDate,
          mode: input.mode ?? int.mode,
          notes: input.notes ?? int.notes,
        };
      })
    );
  };

  const deleteInterview = (id: string) => {
    setInterviews((prev) => prev.filter((int) => int.interviewId !== id));
  };

  // Resumes operations
  const addResume = (file: { name: string; size: number; type: string }): ResumeMetadata => {
    const newResume: ResumeMetadata = {
      resumeId: `res-uuid-${Date.now().toString(36)}`,
      fileName: file.name,
      contentType: file.type || "application/pdf",
      sizeBytes: file.size,
      status: "READY",
      createdAt: new Date().toISOString(),
    };
    setResumes((prev) => [newResume, ...prev]);
    return newResume;
  };

  const deleteResume = (id: string) => {
    setResumes((prev) => prev.filter((res) => res.resumeId !== id));
  };

  return (
    <MockDataContext.Provider
      value={{
        profile,
        updateProfile,
        addSkill,
        removeSkill,
        applications,
        getApplication,
        addApplication,
        updateApplication,
        deleteApplication,
        interviews,
        getInterviewsByApplication,
        addInterview,
        updateInterview,
        deleteInterview,
        resumes,
        addResume,
        deleteResume,
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
};

export const useMockData = () => {
  const context = useContext(MockDataContext);
  if (!context) {
    throw new Error("useMockData must be used within a MockDataProvider");
  }
  return context;
};
