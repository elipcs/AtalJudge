/**
 * DTOs for CSV Import Functionality
 */

export interface CsvQuestionRow {
  title: string;
  text: string;
  timeLimitMs: number;
  memoryLimitKb: number;
  source?: string;
  tags?: string;
  testCaseInput: string;
  testCaseExpectedOutput: string;
  testCaseWeight: number;
}

export interface ImportQuestionsFromCsvDTO {
  csvContent: string;
}

export interface CsvImportError {
  row: number;
  field?: string;
  message: string;
}

export interface CsvImportResult {
  questionsCreated: number;
  testCasesCreated: number;
  errors: CsvImportError[];
  questionIds: string[];
}

export interface ImportQuestionsFromCsvResponseDTO {
  success: boolean;
  result: CsvImportResult;
  message: string;
}
