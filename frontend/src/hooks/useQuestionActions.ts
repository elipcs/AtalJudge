import { useState } from 'react';
import { questionsApi, CreateQuestionRequest } from '@/services/questions';
import { listsApi } from '@/services/lists';
import { logger } from '@/utils/logger';

export function useQuestionActions(questionListId: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createQuestion = async (questionData: Partial<CreateQuestionRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const questionDataWithListId = {
        ...questionData,
        questionListId: questionListId
      };
      
      const newQuestion = await questionsApi.create(questionDataWithListId as CreateQuestionRequest);
      
      if (!newQuestion || !newQuestion.id) {
        throw new Error('Questão criada mas sem ID válido');
      }
      
      return newQuestion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (questionId: string, questionData: Partial<CreateQuestionRequest>) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedQuestion = await questionsApi.update(questionId, questionData);
      
      return updatedQuestion;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (questionId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      await listsApi.removeQuestionFromList(questionListId, questionId);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
