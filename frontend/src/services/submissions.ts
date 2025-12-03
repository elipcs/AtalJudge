import { API } from '../config/api';
import { logger } from '../utils/logger';
import { SubmissionResponseDTO, SubmissionDetailDTO, PaginatedSubmissionsResponse } from '@/types/dtos';

export type SubmissionStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export interface Judge0Submission {
  id: string;
  questionId: string;
  questionListId?: string;
  userId: string;
  language: string;
  code: string;
  status: SubmissionStatus;
  totalScore?: number;      
  createdAt: string;
  updatedAt: string;
  judge0BatchToken?: string;
}

export interface TestResult {
  testCaseId: string;
  verdict: string;
  passed: boolean;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  actualOutput?: string;
  errorMessage?: string | null;
}

export interface SubmissionDetailsResponse {
  id: string;
  userId: string;
  questionId: string;
  code: string;
  language: string;
  status: string;
  score: number;
  totalTests: number;
  passedTests: number;
  executionTimeMs?: number;
  memoryUsedKb?: number;
  verdict?: string;
  errorMessage?: string | null;
  createdAt: string;
  updatedAt: string;
  testResults: TestResult[];
}

export interface SubmissionResult {
  id: string;
  submissionId: string;
  testCaseId: string;
  testCaseName?: string;
  isPublic: boolean;
  passed: boolean;
  pointsAwarded: number;
  expectedOutputSnapshot: string;
  actualOutput?: string;
  stdout?: string;
  stderr?: string;
  statusId?: number;
  statusDescription?: string;
  executionTimeMs?: number;
  memoryKb?: number;
  compileOutput?: string;
}

export interface SubmissionResultsResponse {
  submission: Judge0Submission;
  results: SubmissionResult[];
  summary: {
    passedCount: number;
    totalCases: number;
    totalPoints: number;
    earnedPoints: number;
  };
}

export interface SubmitCodeData {
  questionId: string;
  questionListId?: string;
  language: string;
  code: string;
}

export interface SubmissionFilters {
  questionId?: string;
  questionListId?: string;
  userId?: string;
  verdict?: 'pending' | 'accepted' | 'failed' | 'error' | 'timeout';
  page?: number;
  limit?: number;
}

export const submissionsApi = {
  async getSubmissions(filters?: SubmissionFilters): Promise<PaginatedSubmissionsResponse> {
    try {
      const queryParams: Record<string, string> = {};
      if (filters?.questionId) queryParams.questionId = filters.questionId;
      if (filters?.questionListId) queryParams.questionListId = filters.questionListId;
      if (filters?.userId) queryParams.userId = filters.userId;
      if (filters?.verdict) queryParams.verdict = filters.verdict;
      if (filters?.page) queryParams.page = String(filters.page);
      if (filters?.limit) queryParams.limit = String(filters.limit);

      const { data } = await API.submissions.list(queryParams);
      return data;
    } catch (error) {
      return {
        submissions: [],
        pagination: {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 0
        }
      };
    }
  },

  async getSubmission(id: string): Promise<SubmissionResponseDTO | null> {
    try {
      const { data } = await API.submissions.get(id);
      return data || null;
    } catch (error) {
      return null;
    }
  },

  async getSubmissionResults(id: string): Promise<SubmissionDetailsResponse | null> {
    try {
      const { data } = await API.submissions.getResults(id);
      return data || null;
    } catch (error) {
      return null;
    }
  },

  async submitCode(data: SubmitCodeData): Promise<SubmissionDetailDTO> {
    try {
      const { data: result } = await API.submissions.submit(data);
      return result;
    } catch (error) {
      throw error;
    }
  },

  async resubmit(submissionId: string): Promise<SubmissionResponseDTO> {
    try {
      const { data } = await API.submissions.resubmit(submissionId);
      return data;
    } catch (error) {
      throw error;
    }
  },
};
