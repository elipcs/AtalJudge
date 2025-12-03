import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Question, QuestionList, Submission } from '@/types';
import { listsApi } from '@/services/lists';
import { questionsApi } from '@/services/questions';
import { submissionsApi } from '@/services/submissions';

import { useUserRole } from './useUserRole';

export const useQuestionData = () => {
  const params = useParams();
  const router = useRouter();

  const questionListId = params.id as string;
  const questionIndex = params.questionIndex ? parseInt(params.questionIndex as string) : 0;

  const [question, setQuestion] = useState<Question | null>(null);
  const [list, setList] = useState<QuestionList | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { userRole } = useUserRole();

  const loadList = useCallback(async (questionListId: string): Promise<QuestionList | null> => {
    try {
      const response = await listsApi.getById(questionListId);
      return response;
    } catch (error) {
      return null;
    }
  }, []);

  const loadSubmissions = useCallback(async (questionId: string, questionListId: string): Promise<Submission[]> => {
    try {
      const response = await submissionsApi.getSubmissions({ questionId, questionListId });
      return response as any;
    } catch (error) {
      return [];
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!questionListId) return;

    setLoading(true);
    try {
      const listData = await loadList(questionListId);
      if (!listData) {
        setLoading(false);
        return;
      }

      setList(listData);
      const questions = (listData as any)?.questions || [];
      setAllQuestions(questions);

      if (questions && questions.length > 0) {
        const currentQuestion = questions[questionIndex] || questions[0];
        setQuestion(currentQuestion);

        if (currentQuestion) {
          const questionSubmissions = await loadSubmissions(currentQuestion.id, questionListId);
          setSubmissions(questionSubmissions);
        }
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }, [questionListId, questionIndex, loadList, loadSubmissions]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const submitSolution = async (code: string, language: string): Promise<{ success: boolean; message?: string; submissionId?: string }> => {
    if (!question) {
      return { success: false, message: 'Nenhuma questão selecionada' };
    }

    setSubmitting(true);
    try {
      const response = await submissionsApi.submitCode({
        questionId: question.id,
        questionListId: questionListId,
        code,
        language: language as 'python' | 'java'
      });

      if (response) {
        const updatedSubmissions = await loadSubmissions(question.id, questionListId);
        setSubmissions(updatedSubmissions);
        
        return { 
          success: true, 
          message: 'Código submetido com sucesso!',
          submissionId: response.id 
        };
      } else {
        return { success: false, message: 'Erro ao submeter código' };
      }
    } catch (error) {
      return { success: false, message: 'Erro inesperado ao submeter código' };
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToQuestion = (newIndex: number) => {
    if (newIndex >= 0 && newIndex < allQuestions.length) {
      router.push(`/listas/${questionListId}/questoes?q=${newIndex}`);
    }
  };

  const nextQuestion = () => {
    navigateToQuestion(questionIndex + 1);
  };

  const previousQuestion = () => {
    navigateToQuestion(questionIndex - 1);
  };

  const canGoNext = questionIndex < allQuestions.length - 1;
  const canGoPrevious = questionIndex > 0;

  const getQuestionSubmission = (questionId: string): Submission | null => {
    return submissions.find(sub => sub.question.id === questionId) || null;
  };

  const hasSubmission = (questionId: string): boolean => {
    return submissions.some(sub => sub.question.id === questionId);
  };

  const getSubmissionScore = (questionId: string): number => {
    const submission = getQuestionSubmission(questionId);
    return submission?.score || 0;
  };

  const refreshData = () => {
    fetchData();
  };

  return {
    question,
    list,
    allQuestions,
    submissions,
    loading,
    submitting,
    userRole,
    questionIndex,
    questionListId,
    submitSolution,
    nextQuestion,
    previousQuestion,
    canGoNext,
    canGoPrevious,
    getQuestionSubmission,
    hasSubmission,
    getSubmissionScore,
    refreshData,
    navigateToQuestion
  };
};