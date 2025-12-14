import { API } from '../config/api';
import { TestCaseResponseDTO } from '@/types/dtos';

export interface CreateTestCaseData {
  questionId: string;
  input: string;
  expectedOutput: string;
  weight: number;
  order?: number;
}

export interface UpdateTestCaseData {
  input?: string;
  expectedOutput?: string;
  weight?: number;
  order?: number;
}

export interface ReorderTestCasesData {
  testCaseIds: string[];
}

export const getTestCases = async (questionId: string): Promise<TestCaseResponseDTO[]> => {
  try {
    const response = await API.testCases.list(questionId, { timeout: 60000 });
    const data = response?.data;

    if (Array.isArray(data)) {
      return data;
    } else if (data && typeof data === 'object' && 'testCases' in data) {
      const dataWithTestCases = data as { testCases?: unknown };
      return Array.isArray(dataWithTestCases.testCases) ? dataWithTestCases.testCases : [];
    } else if (data && typeof data === 'object' && Array.isArray(Object.values(data)[0])) {
      const firstArray = Object.values(data).find(v => Array.isArray(v)) as TestCaseResponseDTO[] | undefined;
      return firstArray || [];
    }

    return [];
  } catch (error: any) {
    console.error('Erro ao buscar casos de teste:', error);
    return [];
  }
};

export const getTestCase = async (questionId: string, testCaseId: string): Promise<TestCaseResponseDTO> => {
  try {
    const { data } = await API.testCases.get(testCaseId);
    return data;
  } catch (error) {
    const testCases = await getTestCases(questionId);
    const testCase = testCases.find(tc => tc.id === testCaseId);
    if (!testCase) throw new Error('Test case not found');
    return testCase;
  }
};

export const createTestCase = async (
  questionId: string,
  data: CreateTestCaseData
): Promise<TestCaseResponseDTO> => {
  const { data: created } = await API.testCases.create(questionId, data);
  return created;
};

export const updateTestCase = async (
  questionId: string,
  testCaseId: string,
  data: UpdateTestCaseData
): Promise<TestCaseResponseDTO> => {
  const { data: updated } = await API.testCases.update(questionId, testCaseId, data);
  return updated;
};

export const deleteTestCase = async (
  questionId: string,
  testCaseId: string
): Promise<void> => {
  await API.testCases.delete(questionId, testCaseId);
};

export const reorderTestCases = async (
  questionId: string,
  testCaseIds: string[]
): Promise<void> => {
  await API.testCases.reorder(questionId, testCaseIds);
};

export interface GenerateTestCasesRequest {
  oracleCode: string;
  language: 'python' | 'java';
  count: number;
  use_supervision?: boolean;
}

export interface GeneratedTestCase {
  input: string;
  expectedOutput: string;
}

export interface GenerateTestCasesResponse {
  testCases: GeneratedTestCase[];
  totalGenerated: number;
  algorithmTypeDetected?: string;
}

export const generateTestCases = async (
  questionId: string,
  data: GenerateTestCasesRequest,
  abortSignal?: AbortSignal
): Promise<GenerateTestCasesResponse> => {
  const config: any = { timeout: 600000 }; // 10 minutes
  if (abortSignal) {
    config.signal = abortSignal;
  }
  const { data: result } = await API.testCases.generate(questionId, data, config);
  return result;
};

export interface ImportFromFileResponse {
  imported: number;
  failed: number;
  errors?: string[];
}

export const importFromFile = async (
  questionId: string,
  formData: FormData
): Promise<ImportFromFileResponse> => {
  const response = await API.testCases.importFromFile(questionId, formData);
  return response.data;
};