import { APIGatewayProxyEventV2 } from "aws-lambda";

export interface CognitoJwtClaims {
  sub: string;
  email?: string;
  name?: string;
  "cognito:username"?: string;
  [key: string]: unknown;
}

export interface AuthenticatedEvent extends APIGatewayProxyEventV2 {
  requestContext: APIGatewayProxyEventV2["requestContext"] & {
    authorizer?: {
      jwt?: {
        claims: CognitoJwtClaims;
        scopes?: string[];
      };
    };
  };
}

export interface AuthUser {
  userId: string;
  email: string;
}

export interface UserProfileRecord {
  PK: string; // USER#<sub-id>
  SK: string; // PROFILE
  entityType: "PROFILE";
  displayName: string;
  email: string;
  skills: string[];
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ONLINE_ASSESSMENT"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN";

export interface ApplicationRecord {
  PK: string; // USER#<sub-id>
  SK: string; // APP#<applicationId>
  entityType: "APPLICATION";
  applicationId: string;
  companyName: string;
  jobTitle: string;
  jobDescription?: string;
  requiredSkills: string[];
  status: ApplicationStatus;
  applicationDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string; // USER#<sub-id>#STATUS#<status>
  GSI1SK: string; // <createdAt>#APP#<applicationId>
  GSI2PK: string; // USER#<sub-id>#APPLICATIONS
  GSI2SK: string; // <createdAt>#APP#<applicationId>
}

export type InterviewMode = "ONLINE" | "IN_PERSON" | "PHONE";

export interface InterviewRecord {
  PK: string; // USER#<sub-id>
  SK: string; // INTERVIEW#<interviewId>
  entityType: "INTERVIEW";
  interviewId: string;
  applicationId: string;
  companyName?: string;
  jobTitle?: string;
  roundName: string;
  interviewDate: string;
  mode: InterviewMode;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  GSI3PK: string; // USER#<sub-id>#INTERVIEWS
  GSI3SK: string; // <interviewDate>#INTERVIEW#<interviewId>
}

export type ResumeStatus = "PENDING_UPLOAD" | "READY" | "FAILED";

export interface ResumeRecord {
  PK: string; // USER#<sub-id>
  SK: string; // RESUME#<resumeId>
  entityType: "RESUME";
  resumeId: string;
  fileName: string;
  s3Key: string;
  s3Bucket: string;
  contentType: string;
  sizeBytes: number;
  status: ResumeStatus;
  createdAt: string;
  updatedAt: string;
}


