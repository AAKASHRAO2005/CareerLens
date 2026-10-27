import { ApplicationStatus } from "@/lib/formatters";

export interface JobApplication {
  applicationId: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  requiredSkills: string[];
  status: ApplicationStatus;
  applicationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateApplicationInput {
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  requiredSkills?: string[];
  status?: ApplicationStatus;
  applicationDate?: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  requiredSkills?: string[];
  status?: ApplicationStatus;
  applicationDate?: string;
  notes?: string;
}
