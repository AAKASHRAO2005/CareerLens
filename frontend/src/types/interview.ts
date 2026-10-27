export type InterviewMode = "ONLINE" | "IN_PERSON" | "PHONE";

export interface Interview {
  interviewId: string;
  applicationId: string;
  companyName?: string;
  jobTitle?: string;
  roundName: string;
  interviewDate: string;
  mode: InterviewMode;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateInterviewInput {
  applicationId: string;
  roundName: string;
  interviewDate: string;
  mode: InterviewMode;
  notes?: string;
}

export interface UpdateInterviewInput {
  roundName?: string;
  interviewDate?: string;
  mode?: InterviewMode;
  notes?: string;
}
