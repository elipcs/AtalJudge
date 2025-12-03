/**
 * @module dtos/DatasetDtos
 * @description Data Transfer Objects for dataset import functionality
 */

/**
 * Dataset Problem Search Result DTO
 * Represents a problem from the Code-Contests-Plus dataset in search results
 */
export interface DatasetProblemDTO {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  time_limit: number;
  memory_limit: number;
  tags: string[];
  source: string;
  config: string;
}

/**
 * Dataset Problem Detail DTO
 * Full problem details including test cases and metadata
 */
export interface DatasetProblemDetailDTO {
  id: string;
  title: string;
  description: string;
  full_description: string;
  input_format: string;
  output_format: string;
  difficulty: string;
  time_limit: number;
  memory_limit: number;
  tags: string[];
  sample_inputs: string[];
  sample_outputs: string[];
  source: string;
  config: string;
}

/**
 * Dataset Test Case Preview DTO
 * Preview of a test case from the dataset
 */
export interface DatasetTestCaseDTO {
  input: string;
  expectedOutput: string;
  weight: number;
  isExample: boolean;
}

/**
 * Import Test Cases from Dataset DTO
 * Request to import test cases from a dataset problem
 */
export interface ImportTestCasesFromDatasetDTO {
  questionTitle: string; // Title of the question to search in the dataset
  config: string;
  testCasesToImport?: number; // Number of test cases to import, or all if not specified
}

/**
 * Import Dataset Problem DTO
 * Request to download dataset problem and populate database
 */
export interface ImportDatasetProblemDTO {
  problemTitle: string; // Title to search in the dataset
  datasetConfig: '1x' | '2x' | '3x'; // Dataset configuration
  includeAllTestCases?: boolean; // Whether to include all test cases (default: true)
  maxTestCases?: number; // Maximum number of test cases to import
  jwtToken?: string; // JWT token for authentication with test-case-manager
}

/**
 * Import Dataset Problem Response DTO
 * Response after importing a dataset problem
 */
export interface ImportDatasetProblemResponseDTO {
  success: boolean;
  question: {
    id: string;
    title: string;
    source: string;
  };
  testCasesImported: number;
  message: string;
}

/**
 * Bulk Import Dataset DTO
 * Request to import all problems from a dataset
 */
export interface BulkImportDatasetDTO {
  datasetConfig: '1x' | '2x' | '3x'; // Dataset configuration
  maxProblems?: number; // Maximum number of problems to import (optional, for testing)
  skipExisting?: boolean; // Skip problems that already exist (default: true)
  includeAllTestCases?: boolean; // Whether to include all test cases (default: true)
  maxTestCasesPerProblem?: number; // Maximum test cases per problem (optional)
  jwtToken?: string; // JWT token for authentication with test-case-manager
}

/**
 * Bulk Import Progress DTO
 * Progress information during bulk import
 */
export interface BulkImportProgressDTO {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  current?: string; // Current problem being processed
  errors: Array<{
    problemTitle: string;
    error: string;
  }>;
}

/**
 * Bulk Import Dataset Response DTO
 * Response after bulk import operation
 */
export interface BulkImportDatasetResponseDTO {
  success: boolean;
  summary: {
    totalAttempted: number;
    successfulImports: number;
    failedImports: number;
    skippedExisting: number;
    totalTestCasesImported: number;
  };
  importedQuestions: Array<{
    id: string;
    title: string;
    testCasesCount: number;
  }>;
  errors: Array<{
    problemTitle: string;
    error: string;
  }>;
  message: string;
  duration: number; // Duration in milliseconds
}
