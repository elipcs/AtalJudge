import { UserRole } from './index';

export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string | Date;
  lastLogin?: string | Date;
  studentRegistration?: string;
}

export interface ClassResponseDTO {
  id: string;
  name: string;
  professorId: string;
  professorName?: string;
  studentIds?: string[];
  professor?: { id: string; name: string; email: string; role: string };
  students?: Array<{ id: string; name: string; email: string; role: string; studentRegistration?: string; createdAt: string }>;
  studentCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface GradeResponseDTO {
  id: string;
  studentId: string;
  questionListId: string;
  score: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  studentName?: string;
  questionListTitle?: string;
}

export interface QuestionExampleDTO {
  input: string;
  output: string;
}

export interface QuestionResponseDTO {
  id: string;
  title: string;
  text: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  examples: QuestionExampleDTO[];
  referenceCode?: string;
  referenceLanguage?: string;
  oracleCode?: string;
  oracleLanguage?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface QuestionListResponseDTO {
  id: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  scoringMode: 'simple' | 'groups';
  maxScore: number;
  minQuestionsForMaxScore?: number;
  questionGroups?: unknown[];
  isRestricted: boolean;
  countTowardScore: boolean;
  classIds?: string[];
  questions?: unknown[];
  questionCount?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  calculatedStatus?: 'next' | 'open' | 'closed';
}

export interface TestCaseResponseDTO {
  id: string;
  questionId: string;
  input: string;
  expectedOutput: string;
  weight: number;
  createdAt: string | Date;
}

export type ProgrammingLanguage = string;
export type SubmissionStatus = string;

export interface SubmissionResponseDTO {
  id: string;
  userId: string;
  questionId: string;
  questionListId?: string;
  code: string;
  language: ProgrammingLanguage;
  status: SubmissionStatus;
  score: number;
  totalTests: number;
  passedTests: number;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  verdict?: string;
  errorMessage?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userName?: string;
  userEmail?: string;
  questionName?: string;
  questionListTitle?: string;
}

export interface TestCaseResultDTO {
  testCaseId: string;
  verdict: string;
  passed: boolean;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  errorMessage?: string;
}

export interface HiddenTestsSummaryDTO {
  total: number;
  passed: number;
  failed: number;
}

export interface SubmissionDetailDTO extends SubmissionResponseDTO {
  sampleTestResults: TestCaseResultDTO[];
  hiddenTestsSummary: HiddenTestsSummaryDTO;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedSubmissionsResponse {
  submissions: SubmissionResponseDTO[];
  pagination: PaginationMetadata;
}

export interface InviteResponseDTO {
  id: string;
  role: UserRole;
  token: string;
  link: string;
  maxUses: number;
  currentUses: number;
  classId?: string;
  className?: string;
  createdById?: string;
  creatorName?: string;
  expiresAt: string | Date;
  isUsed: boolean;
  usedAt?: string | Date;
  createdAt: string | Date;
}

