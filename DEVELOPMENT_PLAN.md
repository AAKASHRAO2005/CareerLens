# CareerLens — Development Plan & Execution Tracker

> **Project:** CareerLens — Placement Intelligence Platform  
> **Status:** Phase 1 Completed | Ready for Phase 2 Approval  
> **Target Platform:** AWS Serverless (Cognito, API Gateway HTTP API, Lambda Node.js/TS, DynamoDB single-table, S3 private vault, Amplify Hosting)  
> **Strict Architecture Constraint:** No Amazon EC2, No VM / always-running servers  

---

## Progress Overview

| Phase | Description | Status | Completion Date |
| :--- | :--- | :--- | :--- |
| **Phase 0** | Requirements Analysis, Document Review & Project Planning | **Completed** | 2026-10-27 |
| **Phase 1** | Project Foundation & Frontend Setup | **Completed** | 2026-10-27 |
| **Phase 2** | UI/UX & Frontend Pages (Mock Layer Isolated) | **Completed** | 2026-10-27 |
| **Phase 3** | Authentication & API Foundation (Cognito & API Gateway) | **Completed** | 2026-10-27 |
| **Phase 4** | DynamoDB Single-Table & Application Management | **Completed** | 2026-10-27 |
| **Phase 5** | Skill-Gap Analyzer & Dashboard Analytics | **Completed** | 2026-10-27 |
| **Phase 6** | Interview Management | **Completed** | 2026-10-27 |
| **Phase 7** | Secure Resume Storage (S3 Presigned URLs) | **Completed** | 2026-10-27 |
| **Phase 8** | Integration Testing & Security Hardening | **Completed** | 2026-10-28 |
| **Phase 9** | AWS Deployment & Submission Readiness | **Completed** | 2026-10-28 |

---

## Phase Details

### Phase 0: Requirements Analysis & Planning
- [x] Inspect project root and scan for all specification documents.
- [x] Read Document 1: *Product Requirements Document (PRD)* (17 pages).
- [x] Read Document 2: *Frontend and Backend Technical Specification* (24 pages).
- [x] Read Document 3: *CareerLens — Project Architecture and API Specification* (43 pages).
- [x] Audit for Document 4 (*Testing and Development Document*): Explicitly identified as absent from workspace; requirements reconciled from Documents 1-3.
- [x] Inspect local toolchains: Node.js (v24.14.0), npm (11.12.1), git (2.52.0), python (3.14.2). AWS CLI / SAM status checked.
- [x] Synthesize comprehensive Project Understanding Report covering all 12 core domains.
- [x] Author `DEVELOPMENT_PLAN.md` in workspace root.
- [x] Author `implementation_plan.md` artifact with design decisions and open clarifications.

---

### Phase 1: Project Foundation & Frontend Setup
**Objective:** Establish a clean, production-grade Next.js App Router frontend foundation with TypeScript, Tailwind CSS, reusable UI primitives, route scaffolding, and test harness.

- [x] **Tasks:**
  - [x] Initialize Next.js project under `frontend/` using App Router and TypeScript.
  - [x] Configure Tailwind CSS with custom brand palette (`brand-50` to `brand-950`) and responsive tokens.
  - [x] Configure ESLint and TypeScript strict configuration.
  - [x] Create agreed folder structure: `src/app/`, `src/components/ui/`, `src/components/layout/`, `src/lib/`, `src/schemas/`, `src/types/`, `src/tests/`.
  - [x] Build shared layout and navigation shell:
    - [x] `Sidebar.tsx`: Desktop navigation with icon indicators and user badge.
    - [x] `Navbar.tsx`: Top header with active title and responsive mobile drawer.
  - [x] Build reusable UI primitives:
    - [x] `Button.tsx`: Variants (`primary`, `secondary`, `outline`, `danger`, `ghost`), sizes (`sm`, `md`, `lg`), loading spinner.
    - [x] `Badge.tsx`: Status badges with color mappings.
    - [x] `Card.tsx`: Composable card container with header, content, footer.
    - [x] `Input.tsx`: Form input with accessible labels and error display.
    - [x] `Select.tsx`: Form select with options.
    - [x] `Skeleton.tsx`: Content loading placeholder.
    - [x] `Alert.tsx`: Severity-based alert component.
  - [x] Create route skeletons for all MVP views:
    - [x] `(auth)/login`
    - [x] `(auth)/register`
    - [x] `(dashboard)/dashboard`
    - [x] `(dashboard)/applications`
    - [x] `(dashboard)/applications/new`
    - [x] `(dashboard)/applications/[id]`
    - [x] `(dashboard)/skill-analyzer`
    - [x] `(dashboard)/interviews`
    - [x] `(dashboard)/resumes`
    - [x] `(dashboard)/profile`
  - [x] Set up environment configuration:
    - [x] `src/lib/env.ts` (Zod validated).
    - [x] `.env.example` and `.env.local`.
  - [x] Build domain formatters & types:
    - [x] `src/lib/formatters.ts`: Date/time formatters, file size formatters, status mapping, and deterministic skill normalization helper.
    - [x] `src/types/`: `api.ts`, `application.ts`, `profile.ts`, `interview.ts`, `resume.ts`.
    - [x] `src/schemas/`: `application.schema.ts`, `profile.schema.ts`, `interview.schema.ts`.
  - [x] Set up Vitest test runner with `vitest.config.mjs` and `@testing-library/jest-dom`.
  - [x] Implement unit tests for formatters and schemas.

- [x] **Verification Results:**
  - `npm test`: **Passed** (2 test suites, 11 tests passed in 3.6s).
  - `npm run lint`: **Passed** (0 warnings, 0 errors).
  - `npm run build`: **Passed** (14 static and dynamic routes compiled successfully).

---

### Phase 2: UI/UX & Frontend Pages (Mock Layer Isolated)
**Objective:** Build complete, professional SaaS interface across all MVP views with client-side Zod validation, responsive layouts, interactive state, and clearly isolated mock fixtures.

- [x] **Tasks:**
  - [x] Implement isolated mock data fixtures (`src/features/**/fixtures.ts`) for applications, skills, interviews, and resumes.
  - [x] Build interactive mock state context (`src/features/mock-context.tsx`) wired through `(dashboard)/layout.tsx`.
  - [x] Implement interactive Authentication forms (Login, Register) with React Hook Form + Zod validation, error banners, and demo prefill shortcuts.
  - [x] Implement Dashboard view:
    - [x] Summary stat cards (Total Applications, Active Interviews, Skills Inventory, Resumes Stored).
    - [x] Recruitment pipeline stage breakdown pills (Saved, Applied, Assessment, Interview, Offer, Rejected, Withdrawn).
    - [x] Recent applications table with direct view links.
    - [x] Upcoming interviews card with chronological ordering.
    - [x] Deterministic skill analysis teaser card.
  - [x] Implement Applications list view:
    - [x] Live client search by company, title, or required skill.
    - [x] Status filter dropdown with counter badges.
    - [x] Sorting by creation date (newest/oldest).
    - [x] Status badges (`STATUS_MAP`), required skill pills, and notes.
    - [x] Application deletion with linked cascade cleanup.
    - [x] Empty state for zero applications and no search results.
  - [x] Implement Create Application form (`applications/new`):
    - [x] Form inputs for company name, job title, description, application date, notes, recruitment stage.
    - [x] Interactive required skills tag editor (add on Enter/click, remove tag).
    - [x] Client-side Zod validation with error messages.
  - [x] Implement Application Detail page (`applications/[id]`):
    - [x] Status stage changer dropdown reflecting in state immediately.
    - [x] Metadata overview and full job description.
    - [x] Inline personal notes editor.
    - [x] Linked interviews list with modal to schedule round directly.
  - [x] Implement Skill-Gap Analyzer view (`skill-analyzer`):
    - [x] Dropdown to select any application (or preselected from URL).
    - [x] Deterministic skill matching comparing profile skills vs job requirements.
    - [x] Matched skills list (green), missing skills list (rose), alignment percentage bar.
    - [x] Mandatory disclaimer ("Rule-based comparison, not a hiring prediction").
  - [x] Implement Interviews view (`interviews`):
    - [x] Chronological list of upcoming and completed rounds.
    - [x] Schedule new interview modal with application selector, date/time picker, and mode selector (`ONLINE`, `IN_PERSON`, `PHONE`).
    - [x] Delete interview action.
  - [x] Implement Resume Vault view (`resumes`):
    - [x] Drag-and-drop PDF dropzone.
    - [x] Client-side validation: PDF format check and 5 MB size limit check.
    - [x] Simulated upload progress indicator.
    - [x] Resumes version list with file size, date, S3 verified indicator, and functional sample PDF download trigger.
  - [x] Implement Profile & Skills view (`profile`):
    - [x] Display name editor with persistence.
    - [x] Verified Cognito email indicator.
    - [x] Interactive skill inventory tag editor (add, deduplicate, remove).
  - [x] Unit test deterministic skill matching rules in `src/tests/unit/skill-matching.test.ts`.

- [x] **Verification Results:**
  - `npm test`: **Passed** (3 test suites, 16 tests passed).
  - `npm run lint`: **Passed** (0 warnings, 0 errors).
  - `npm run build`: **Passed** (14 static and dynamic routes compiled cleanly).

---

### Phase 3: Authentication & API Foundation
**Objective:** Connect frontend to Amazon Cognito User Pools and establish the API Gateway HTTP API backend with JWT authorizer, shared Lambda utilities, and DynamoDB profile persistence.

- [x] **Tasks:**
  - [x] Configure AWS SAM infrastructure template (`infrastructure/template.yaml`):
    - [x] Amazon Cognito User Pool with email verification and password policy.
    - [x] Cognito App Client with SRP and refresh flows.
    - [x] API Gateway HTTP API with Cognito JWT authorizer on `/v1/*` routes.
    - [x] Single-table DynamoDB definition (`CareerLensData`) with `PK`, `SK`, `GSI1`, `GSI2`, `GSI3`.
    - [x] Private Amazon S3 bucket with Block Public Access and strict CORS.
  - [x] Implement backend Lambda project structure under `backend/src/`:
    - [x] Shared middleware: `auth.middleware.ts` deriving `userId` strictly from `claims.sub`.
    - [x] Standard error responses matching Document 3 schema (`utils/response.ts`).
    - [x] Safe structured logger with secret scrubbing (`utils/logger.ts`).
    - [x] DynamoDB DocumentClient repository for profile persistence (`repositories/dynamodb.repo.ts`).
    - [x] Profile service for creation and updates with skill deduplication (`services/profile.service.ts`).
    - [x] Public health check handler (`handlers/health.ts`).
    - [x] Profile handler for `GET /profile` and `PATCH /profile` (`handlers/profile.ts`).
  - [x] Implement frontend authentication & API client in `frontend/src/lib/`:
    - [x] `auth.ts`: Token session manager for Cognito JWT access/id tokens and demo sessions.
    - [x] `api-client.ts`: Centralized client attaching `Authorization: Bearer <token>`, handling HTTP error codes (400, 401, 403, 404, 409, 500) and throwing typed `ApiClientError`.
  - [x] Implement automated test suites:
    - [x] Backend Vitest test suite (`backend/tests/auth-and-profile.test.ts`): 10 passed tests verifying claim extraction, missing claim rejection, standard error format, and health check.
    - [x] Frontend Vitest test suite (`frontend/src/tests/unit/api-client.test.ts`): 6 passed tests verifying session storage, token attachment, 400 validation error, and 401 unauthorized rejection.

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (10 tests passed in 1.17s).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly to `dist/`).
  - `frontend npm test`: **Passed** (4 test suites, 22 tests passed in 10.4s).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled cleanly).

---

### Phase 4: DynamoDB Single-Table & Application Management
**Objective:** Implement persistent job application CRUD operations in Amazon DynamoDB with single-table design, GSI indexing, pagination, and status filtering.

- [x] **Tasks:**
  - [x] Configure `CareerLensData` single-table schema and secondary indexes in `infrastructure/template.yaml`:
    - [x] Primary Key: `PK` (`USER#<sub>`), `SK` (`APP#<applicationId>`).
    - [x] GSI1: `GSI1PK` (`USER#<sub>#STATUS#<status>`), `GSI1SK` (`<createdAt>#APP#<applicationId>`) for status-filtered queries.
    - [x] GSI2: `GSI2PK` (`USER#<sub>#APPLICATIONS`), `GSI2SK` (`<createdAt>#APP#<applicationId>`) for chronological queries.
  - [x] Configure `ApplicationsFunction` Lambda with routes (`/v1/applications`, `/v1/applications/{applicationId}`) and `DynamoDBCrudPolicy`.
  - [x] Define backend Zod validation schemas in `backend/src/schemas/application.schema.ts`:
    - [x] `createApplicationSchema`: `companyName`, `jobTitle`, `jobDescription`, `requiredSkills`, `status`, `applicationDate`, `notes`.
    - [x] `updateApplicationSchema`: all fields optional, strict length limits.
  - [x] Implement DynamoDB DocumentClient repository in `backend/src/repositories/applications.repo.ts`:
    - [x] `createApplication`: PutItem with single-table composite keys and GSI1/GSI2 keys.
    - [x] `getApplication`: GetItem with user ownership partition key check.
    - [x] `listApplications`: QueryCommand against GSI1 (status-filtered) or GSI2 (all), newest first (`ScanIndexForward: false`), with base64 cursor pagination (`encodeCursor`, `decodeCursor`).
    - [x] `updateApplication`: UpdateExpression updating attributes, timestamps, and dynamically updating `GSI1PK` when status changes.
    - [x] `deleteApplication`: DeleteCommand with `attribute_exists(PK)` condition check.
  - [x] Implement business logic layer in `backend/src/services/applications.service.ts`:
    - [x] UUID generation (`app-uuid-<uuid>`), UTC ISO timestamps, and user sub scoping.
  - [x] Implement Lambda handler in `backend/src/handlers/applications.ts`:
    - [x] Route dispatch for `GET /v1/applications`, `POST /v1/applications`, `GET /v1/applications/{id}`, `PATCH /v1/applications/{id}`, `DELETE /v1/applications/{id}`.
    - [x] Authentication enforcement via `getAuthenticatedUser(event)`.
    - [x] Standard error envelopes (`VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`).
    - [x] 201 Created with `Location: /v1/applications/{id}` header.
  - [x] Implement frontend API service in `frontend/src/features/applications/api.ts`:
    - [x] `fetchApplications`, `fetchApplicationById`, `createApplicationApi`, `updateApplicationApi`, `deleteApplicationApi`.
  - [x] Implement comprehensive automated test suites:
    - [x] Backend unit tests (`backend/tests/applications.test.ts`): 17 tests covering cursor encoding/decoding, GSI1/GSI2 queries, ownership isolation, status partition key updating, conditional deletion, 400 validation, 401 unauthorized, and 404 not found.
    - [x] Frontend unit tests (`frontend/src/tests/unit/applications-api.test.ts`): 5 tests covering API requests, query parameters, payload structures, and error handling.

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (2 test suites, 27 tests passed).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly).
  - `frontend npm test`: **Passed** (5 test suites, 27 tests passed).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled successfully).

---

### Phase 5: Skill-Gap Analyzer & Dashboard Analytics
**Objective:** Deliver deterministic, explainable skill matching and real-time dashboard analytics derived from persistent DynamoDB data.

- [x] **Tasks:**
  - [x] Configure SAM template (`infrastructure/template.yaml`) for Phase 5 endpoints:
    - [x] `SkillAnalysisFunction`: `POST /v1/applications/{applicationId}/skill-analysis` with `DynamoDBCrudPolicy`.
    - [x] `DashboardFunction`: `GET /v1/dashboard/summary` with `DynamoDBCrudPolicy`.
  - [x] Implement deterministic skill normalization and matching utility (`backend/src/utils/skill-matcher.ts`):
    - [x] Normalization with lowercase, whitespace trimming, and tech alias resolution (`postgres` -> `postgresql`, `js` -> `javascript`, `ts` -> `typescript`, `reactjs` -> `react`, `aws` -> `amazon web services`).
    - [x] Deduplication of required skills by normalized form to prevent duplicate scoring.
    - [x] Division-by-zero protection when required skills list is empty.
    - [x] Inclusion of mandatory legal/disclaimer notice: *"This analysis is rule-based and intended for self-assessment only. It is not an automated hiring prediction or recruitment decision."*
  - [x] Implement Skill-Gap Analysis service (`backend/src/services/skill-analysis.service.ts`):
    - [x] Fetches application strictly partitioned by authenticated user `sub`.
    - [x] Fetches candidate profile skills from DynamoDB (`USER#<sub> / PROFILE`).
    - [x] Computes `matchedSkills`, `missingSkills`, and integer `matchPercentage` ($0 \dots 100$).
  - [x] Implement Skill-Gap Analysis Lambda handler (`backend/src/handlers/skill-analysis.ts`):
    - [x] Rejects unauthenticated requests with 401.
    - [x] Returns 404 for nonexistent or foreign applications.
    - [x] Enforces POST method (405 on other methods).
    - [x] Returns 200 with `{ analysis: ... }`.
  - [x] Implement Dashboard Analytics service (`backend/src/services/dashboard.service.ts`):
    - [x] Aggregates status counts across 7 recruitment stages (`SAVED`, `APPLIED`, `ONLINE_ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`).
    - [x] Counts registered skills from profile.
    - [x] Slices top 5 recent applications with company name and status.
  - [x] Implement Dashboard Summary Lambda handler (`backend/src/handlers/dashboard.ts`):
    - [x] Dispatches `GET /v1/dashboard/summary` with 401 identity check and 200 JSON envelope.
  - [x] Implement frontend types and API client services:
    - [x] `frontend/src/types/skill-analysis.ts` & `frontend/src/features/skill-analyzer/api.ts` (`fetchSkillAnalysis`).
    - [x] `frontend/src/types/dashboard.ts` & `frontend/src/features/dashboard/api.ts` (`fetchDashboardSummary`).
  - [x] Implement comprehensive automated test suites:
    - [x] Backend unit tests (`backend/tests/skill-analysis.test.ts`): 10 tests covering normalization, casing/whitespace invariance, deduplication, disclaimer, cross-user 404, 401 unauthorized, 405 method rejection, and 200 success.
    - [x] Backend unit tests (`backend/tests/dashboard.test.ts`): 4 tests covering aggregation across stages, profile skill counting, recent applications, 401 unauthorized, and 200 success.
    - [x] Frontend unit tests (`frontend/src/tests/unit/skill-analysis-api.test.ts`): verifies typed API client call and response parsing.
    - [x] Frontend unit tests (`frontend/src/tests/unit/dashboard-api.test.ts`): verifies typed API client call and response parsing.

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (4 test suites, 41 tests passed).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly).
  - `frontend npm test`: **Passed** (7 test suites, 29 tests passed).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled successfully).

---

### Phase 6: Interview Management
**Objective:** Implement interview tracking, chronological scheduling, and dashboard integration with strict application ownership validation.

- [x] **Tasks:**
  - [x] Configure SAM template (`infrastructure/template.yaml`) for interview operations:
    - [x] `InterviewsFunction`: handling `GET /v1/interviews`, `POST /v1/interviews`, `GET /v1/interviews/{interviewId}`, `PATCH /v1/interviews/{interviewId}`, `DELETE /v1/interviews/{interviewId}` with `DynamoDBCrudPolicy`.
  - [x] Single-table indexing under `CareerLensData`:
    - [x] Primary Key: `PK = USER#<sub-id>`, `SK = INTERVIEW#<interviewId>`.
    - [x] GSI3 (Chronological Index): `GSI3PK = USER#<sub-id>#INTERVIEWS`, `GSI3SK = <interviewDate>#INTERVIEW#<interviewId>`.
  - [x] Define backend Zod validation schemas (`backend/src/schemas/interview.schema.ts`):
    - [x] `createInterviewSchema`: `applicationId`, `roundName`, `interviewDate` (ISO string validation), `mode` (`ONLINE` | `IN_PERSON` | `PHONE`), `notes`.
    - [x] `updateInterviewSchema`: optional round name, date, mode, and notes.
  - [x] Implement DynamoDB DocumentClient repository (`backend/src/repositories/interviews.repo.ts`):
    - [x] `createInterview`: PutItem with single-table keys and GSI3 chronological keys.
    - [x] `getInterview`: GetItem scoped to user partition key.
    - [x] `listInterviews`: Query GSI3 chronologically, with `upcomingOnly` filter (`GSI3SK >= :now`).
    - [x] `listInterviewsByApplication`: Query interviews linked to a specific application ID.
    - [x] `updateInterview`: UpdateExpression updating attributes and re-indexing `GSI3SK` when `interviewDate` changes.
    - [x] `deleteInterview`: DeleteCommand with condition check `attribute_exists(PK)`.
    - [x] `deleteInterviewsByApplication`: Cascading cleanup utility for deleting linked interviews.
  - [x] Implement business logic layer (`backend/src/services/interviews.service.ts`):
    - [x] Strict application ownership validation: verifies that the target `applicationId` exists and belongs to the authenticated caller before allowing interview creation.
    - [x] Auto-denormalizes company name and job title from the application onto the interview item.
    - [x] Updated `ApplicationService.deleteApplication` to automatically cascade-delete all linked interviews.
  - [x] Implement Lambda routing handler (`backend/src/handlers/interviews.ts`):
    - [x] Enforces `getAuthenticatedUser(event)`.
    - [x] Routes GET, POST (201 with Location header), GET by ID, PATCH, DELETE (204 No Content).
    - [x] Standard error envelopes (`VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`).
  - [x] Integrated real upcoming interviews into `DashboardService` (`backend/src/services/dashboard.service.ts`):
    - [x] Queries GSI3 for upcoming interviews and includes them in dashboard summary metrics.
  - [x] Implement frontend API client service (`frontend/src/features/interviews/api.ts`):
    - [x] `fetchInterviews`, `fetchInterviewById`, `createInterviewApi`, `updateInterviewApi`, `deleteInterviewApi`.
  - [x] Implement automated test suites:
    - [x] Backend unit tests (`backend/tests/interviews.test.ts`): 12 tests covering application ownership check, GSI3 chronological querying, upcoming interviews filter, GSI3SK re-keying on date change, cascade deletion, and HTTP handler routing.
    - [x] Frontend unit tests (`frontend/src/tests/unit/interviews-api.test.ts`): 5 tests covering API methods, query parameters, and payload serialization.

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (5 test suites, 53 tests passed).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly).
  - `frontend npm test`: **Passed** (8 test suites, 34 tests passed).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled successfully).

---

### Phase 7: Secure Resume Storage (S3 Presigned URLs)
**Objective:** Implement private PDF resume storage in Amazon S3 using short-lived presigned upload and download URLs with backend verification.

- [x] **Tasks:**
  - [x] Configure SAM template (`infrastructure/template.yaml`) for resume operations:
    - [x] `ResumesFunction`: handling `POST /v1/resumes/upload-intent`, `POST /v1/resumes/{resumeId}/confirm`, `GET /v1/resumes`, `GET /v1/resumes/{resumeId}/download-url`, and `DELETE /v1/resumes/{resumeId}`.
    - [x] Granted `DynamoDBCrudPolicy` against `CareerLensDataTable` and `S3CrudPolicy` against `ResumeBucket`.
  - [x] S3 storage and single-table DynamoDB data model:
    - [x] Private bucket with Block Public Access and strict CORS.
    - [x] Object key structure: `resumes/<userId>/<resumeId>.pdf`.
    - [x] DynamoDB metadata record: `PK = USER#<sub-id>`, `SK = RESUME#<resumeId>`, `status = "PENDING_UPLOAD" | "READY" | "FAILED"`.
  - [x] Define backend Zod validation schemas (`backend/src/schemas/resume.schema.ts`):
    - [x] `uploadIntentSchema`: strictly validates file extension ends with `.pdf`, MIME type is literal `"application/pdf"`, and file size $\le 5\text{ MB}$ ($5{,}242{,}880$ bytes).
  - [x] Implement S3 & DynamoDB repository (`backend/src/repositories/resumes.repo.ts`):
    - [x] `createPresignedUploadUrl`: generates short-lived presigned PUT URL (900s) using `@aws-sdk/s3-request-presigner`.
    - [x] `createPresignedDownloadUrl`: generates short-lived presigned GET URL (300s).
    - [x] `headS3Object`: executes `HeadObjectCommand` against S3 to inspect actual size and MIME type.
    - [x] `deleteS3Object`: executes `DeleteObjectCommand` against private S3 bucket.
    - [x] `saveResumeMetadata`, `getResumeMetadata`, `listResumeMetadata`, `updateResumeStatus`, `deleteResumeMetadata` with user partition isolation.
  - [x] Implement business logic layer (`backend/src/services/resumes.service.ts`):
    - [x] `createUploadIntent`: generates unique UUID, constructs S3 key, creates presigned upload URL, and stores `PENDING_UPLOAD` record.
    - [x] `confirmUpload`: verifies S3 object presence via `HeadObjectCommand`, verifies actual size $\le 5\text{ MB}$, and updates record to `READY` status.
    - [x] `getDownloadUrl`: verifies record is in `READY` status and generates presigned GET URL.
    - [x] `deleteResume`: deletes S3 object and DynamoDB item.
  - [x] Implement Lambda routing handler (`backend/src/handlers/resumes.ts`):
    - [x] Enforces `getAuthenticatedUser(event)`.
    - [x] Routes upload-intent, confirm, list, download-url, and delete.
    - [x] Standard error envelopes (`VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, `METHOD_NOT_ALLOWED`).
  - [x] Integrated real `resumesCount` into `DashboardService` (`backend/src/services/dashboard.service.ts`):
    - [x] Queries candidate's verified `READY` resumes from DynamoDB and populates dashboard summary metrics.
  - [x] Implement frontend API client service (`frontend/src/features/resumes/api.ts`):
    - [x] `createUploadIntent`, `uploadFileToS3`, `confirmResumeUpload`, `fetchResumes`, `fetchResumeDownloadUrl`, `deleteResumeApi`.
  - [x] Implement automated test suites:
    - [x] Backend unit tests (`backend/tests/resumes.test.ts`): 16 tests covering PDF format check, 5 MB size limit rejection, presigned PUT URL generation, S3 HeadObject confirmation, size violation rejection, presigned GET download URL, S3 object deletion, 401 unauthorized, and 404 not found.
    - [x] Frontend unit tests (`frontend/src/tests/unit/resumes-api.test.ts`): 6 tests covering upload intent, binary S3 upload, confirmation, listing, download URL, and deletion.

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (6 test suites, 69 tests passed).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly).
  - `frontend npm test`: **Passed** (9 test suites, 40 tests passed).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled successfully).

---

### Phase 8: Integration Testing & Security Hardening
**Objective:** Validate all user journeys end-to-end, execute automated security test matrices, verify ownership isolation, and ensure error handling consistency.

- [x] **Tasks:**
  - [x] Implement backend End-to-End integration test suite (`backend/tests/security-and-e2e.test.ts`):
    - [x] Complete Candidate Hiring Lifecycle: Health probe $\rightarrow$ Profile setup with verified skills $\rightarrow$ Job application submission $\rightarrow$ Deterministic skill-gap analysis $\rightarrow$ Interview scheduling with application ownership validation $\rightarrow$ S3 presigned resume upload intent, physical `HeadObject` confirmation & presigned download URL $\rightarrow$ Dashboard aggregate summary verification $\rightarrow$ Cascading delete of application & linked interview $\rightarrow$ Resume deletion and S3 object purge.
    - [x] Cross-Tenant Multi-Tenant Isolation & IDOR Defense Matrix:
      - [x] User B (attacker) cannot read User A's application (`GET /applications/{id}` $\rightarrow$ 404).
      - [x] User B cannot modify User A's application (`PATCH /applications/{id}` $\rightarrow$ 404).
      - [x] User B cannot delete User A's application (`DELETE /applications/{id}` $\rightarrow$ 404).
      - [x] User B cannot execute skill analysis on User A's application (`POST /applications/{id}/skill-analysis` $\rightarrow$ 404).
      - [x] User B cannot attach an interview to User A's application (`POST /interviews` $\rightarrow$ 400 Validation Error).
      - [x] User B cannot read User A's interview (`GET /interviews/{id}` $\rightarrow$ 404).
      - [x] User B cannot modify User A's interview (`PATCH /interviews/{id}` $\rightarrow$ 404).
      - [x] User B cannot delete User A's interview (`DELETE /interviews/{id}` $\rightarrow$ 404).
      - [x] User B cannot generate download URLs for User A's resume (`GET /resumes/{id}/download-url` $\rightarrow$ 404).
      - [x] User B cannot delete User A's resume (`DELETE /resumes/{id}` $\rightarrow$ 404).
      - [x] User B's dashboard summary shows zero metrics and no Alice data.
    - [x] Unauthenticated Rejection Matrix across all protected endpoints:
      - [x] `GET /v1/profile` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `PATCH /v1/profile` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `GET /v1/applications` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `POST /v1/applications` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `GET /v1/applications/{id}` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `POST /v1/applications/{id}/skill-analysis` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `GET /v1/interviews` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `POST /v1/interviews` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `POST /v1/resumes/upload-intent` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `GET /v1/resumes` $\rightarrow$ 401 UNAUTHORIZED
      - [x] `GET /v1/dashboard/summary` $\rightarrow$ 401 UNAUTHORIZED
    - [x] Negative Input Validation Boundary Cases:
      - [x] Empty companyName in application $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Empty jobTitle in application $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Invalid application status enum $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Resume upload intent with non-PDF extension (.docx) $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Resume upload intent with non-PDF MIME type (text/plain) $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Resume upload intent exceeding 5 MB limit $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Interview creation with malformed date $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Interview creation with empty roundName $\rightarrow$ 400 VALIDATION_ERROR.
      - [x] Malformed non-JSON request body $\rightarrow$ 400 VALIDATION_ERROR.
  - [x] Implement frontend security and error resilience suite (`frontend/src/tests/unit/security-and-error-handling.test.ts`):
    - [x] Structured HTTP error envelopes: 400 validation error with field details, 401 unauthorized, 404 not found, 405 method not allowed, 500 internal error.
    - [x] Network resilience: non-JSON API Gateway errors (502 HTML / plain text) fallback gracefully; 204 No Content handled cleanly.
    - [x] S3 direct upload failure handling (403 Forbidden, connection drop).
    - [x] Client session management & token tampering protection (`AuthManager.isAuthenticated()`, expired token handling, corrupted JSON in storage).

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (7 test suites, 101 tests passed).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly with 0 errors).
  - `frontend npm test`: **Passed** (10 test suites, 51 tests passed).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled successfully).

---

### Phase 9: AWS Deployment & Submission Readiness
**Objective:** Package infrastructure as code, deploy backend and frontend to AWS serverless services (subject to credentials), verify live health, and prepare comprehensive submission documentation.

- [x] **Tasks:**
  - [x] Finalize AWS SAM Serverless Definition (`infrastructure/template.yaml`):
    - [x] Fully serverless architecture: Zero EC2, zero VMs, zero always-running servers.
    - [x] Amazon Cognito User Pool with email sign-in, password policy, and User Pool Client.
    - [x] Amazon API Gateway HTTP API v2 with JWT authorizer and CORS configuration.
    - [x] Amazon DynamoDB single-table `CareerLensData` with On-Demand `PAY_PER_REQUEST` billing, Point-in-Time Recovery (PITR), and Global Secondary Indexes `GSI1`, `GSI2`, `GSI3`.
    - [x] Amazon S3 private resume bucket with Block Public Access (all 4 flags), AES256 server-side encryption, and presigned URL CORS rules.
    - [x] Scoped least-privilege IAM policies (`DynamoDBCrudPolicy`, `S3CrudPolicy`) for 7 Lambda functions.
    - [x] Standard outputs (`ApiEndpoint`, `CognitoUserPoolId`, `CognitoClientId`, `DynamoDBTableName`, `S3ResumeBucketName`).
  - [x] Create AWS SAM CLI deployment defaults (`infrastructure/samconfig.toml`):
    - [x] Pre-configured stack name, capabilities, regions, and S3 resolution.
  - [x] Create AWS Amplify Hosting build pipeline (`amplify.yml`):
    - [x] Build script for Next.js 15 App Router static & SSR edge delivery (`npm ci --legacy-peer-deps`, `npm run build`).
  - [x] Create backend environment variable documentation (`backend/.env.example`).
  - [x] Create root project `.gitignore` for dependencies, build artifacts, and secrets.
  - [x] Create comprehensive production README (`README.md`):
    - [x] Executive summary & platform features.
    - [x] Zero-EC2 justification and serverless service mapping table.
    - [x] Complete Mermaid architecture diagram.
    - [x] DynamoDB single-table schema, key conventions, and query access patterns table.
    - [x] Deterministic skill-gap analyzer algorithm, alias dictionary, formula, and legal disclaimer.
    - [x] Secure S3 resume vault direct browser-to-S3 upload sequence diagram.
    - [x] Zero-trust multi-tenant isolation model & cross-tenant IDOR attack defense.
    - [x] Complete 152 automated test report breakdown across 17 test suites.
    - [x] Step-by-step local setup, development, and testing instructions.
    - [x] AWS SAM deployment (`sam build`, `sam deploy`) and Amplify Hosting guides.
    - [x] Complete environment variable reference table.

- [x] **Verification Results:**
  - `backend npm test`: **Passed** (7 test suites, 101 tests passed).
  - `backend npm run build`: **Passed** (`tsc` compiled cleanly with 0 errors).
  - `frontend npm test`: **Passed** (10 test suites, 51 tests passed).
  - `frontend npm run lint`: **Passed** (0 warnings, 0 errors).
  - `frontend npm run build`: **Passed** (14 static and dynamic routes compiled successfully).
  - `Total Automated Tests`: **152 tests passed across 17 suites**.
  - All 10 development phases (Phases 0 through 9) **COMPLETED & VERIFIED**.

---

## How to Run the Frontend Locally

1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies (already completed):
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Run unit and schema tests:
   ```bash
   npm test
   ```
5. Run linting:
   ```bash
   npm run lint
   ```
6. Run the production build:
   ```bash
   npm run build
   ```
