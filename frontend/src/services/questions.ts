import { API } from '../config/api';
import { QuestionResponseDTO } from '@/types/dtos';

export interface CreateQuestionRequest {
  title: string;
  text: string;
  timeLimit: string;
  memoryLimit: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
  referenceCode?: string;
  referenceLanguage?: 'python' | 'java';
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>;
  questionListId?: string;
}

export interface UpdateQuestionRequest extends Partial<CreateQuestionRequest> {
  id: string;
}

export const questionsApi = {
  async getAll(): Promise<QuestionResponseDTO[]> {
    try {
      const { data } = await API.questions.list();
      return data.questions || [];
    } catch (error) {
      return [];
    }
  },

  async getById(id: string): Promise<QuestionResponseDTO | null> {
    try {
      const { data } = await API.questions.get(id);
      return data || null;
    } catch (error) {
      return null;
    }
  },

  async create(questionData: CreateQuestionRequest): Promise<QuestionResponseDTO> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(questionData).filter(([_, value]) => value !== undefined)
      ) as CreateQuestionRequest;
      const { data } = await API.questions.create(cleanData);
      if (!data || !data.id) throw new Error('Questão não foi criada corretamente');
      return data;
    } catch (error) {
      throw error;
    }
  },

  async update(id: string, questionData: Partial<CreateQuestionRequest>): Promise<QuestionResponseDTO> {
    try {
      const cleanData = Object.fromEntries(
        Object.entries(questionData).filter(([_, value]) => value !== undefined)
      );
      const { data } = await API.questions.update(id, cleanData);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await API.questions.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  },
};
