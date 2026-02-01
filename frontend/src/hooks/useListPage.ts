import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { QuestionList, Question } from '@/types';
import { listsApi, isCurrentIpAllowedForList } from '@/services/lists';
import { submissionsApi } from '@/services/submissions';
import { useUserRole } from './useUserRole';
import { logger } from '@/utils/logger';

interface LocalSubmission {
  id: string;
  questionId: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  attempt: number;
  submittedAt: string;
  code?: string;
  language?: string;
  feedback?: string;
}


export function useListPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const questionListId = (params?.id as string) || searchParams?.get('id') || '';

  const [list, setList] = useState<QuestionList | null>(null);
  const [submissions, setSubmissions] = useState<LocalSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { userRole, isLoading: isLoadingUserRole } = useUserRole();
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<{
    status: 'pending' | 'accepted' | 'error' | 'timeout';
    message: string;
    score: number;
  } | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'question'>('list');
  const [selectedLanguage, setSelectedLanguage] = useState<'python' | 'java'>('python');

  const loadListData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const listData = await listsApi.getById(questionListId);

      if (!listData) {
        setError(`Lista não encontrada (ID: ${questionListId})`);
        return;
      }

      setList(listData);

      if (userRole === 'student') {
        if (listData.isRestricted) {
          const allowed = await isCurrentIpAllowedForList(questionListId);
          if (!allowed) {
            setError('ipRestricted');
            setLoading(false);
            return;
          }
        }
        await loadSubmissions(listData);
      }

    } catch (err) {
      setError(`Erro ao carregar dados da lista: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }, [questionListId, userRole]);

  const isListStarted = useCallback(() => {
    if (!list) return true;

    if (!list.startDate) {
      // Se não tem data de início definida, considera como já iniciada
      return true;
    }

    const now = new Date();
    const startDate = new Date(list.startDate);

    return now >= startDate;
  }, [list]);

  const isListEnded = useCallback(() => {
    if (!list || userRole !== 'student') return false;

    if (!list.endDate) return false;

    const now = new Date();
    const endDate = new Date(list.endDate);

    return now > endDate;
  }, [list, userRole]);

  const hasQuestions = useCallback(() => {
    return list && list.questions && list.questions.length > 0;
  }, [list]);

  const loadSubmissions = useCallback(async (listData: QuestionList) => {
    try {

      const submissionsPromises = listData.questions.map(question =>
        submissionsApi.getSubmissions({ questionId: question.id, questionListId })
          .then(response => ({
            question,
            submissions: response.submissions
          }))
      );

      const results = await Promise.all(submissionsPromises);

      const allSubmissions: LocalSubmission[] = [];
      results.forEach(({ question, submissions: questionSubmissions }) => {
        const localSubmissions = questionSubmissions.map((sub, index) => ({
          id: sub.id,
          questionId: question.id,
          status: (sub.status as any),
          score: sub.score,
          attempt: index + 1,
          submittedAt: typeof sub.createdAt === 'string' ? sub.createdAt : sub.createdAt.toISOString(),
          code: sub.code,
          language: sub.language,
          feedback: sub.verdict
        }));

        allSubmissions.push(...localSubmissions);
      });

      setSubmissions(allSubmissions);
    } catch (err) {
    }
  }, [questionListId]);

  const navigateToQuestion = useCallback((question: Question, index: number) => {
    setSelectedQuestion(question);
    setCurrentQuestionIndex(index);
    setViewMode('question');
    setCode('');
    setSubmissionResult(null);

    router.push(`/listas/${questionListId}#questao-${question.id}`);
  }, [questionListId, router]);

  const goBack = useCallback(() => {
    setViewMode('list');
    setSelectedQuestion(null);
    setCode('');
    setSubmissionResult(null);
    router.push(`/listas/${questionListId}`);
  }, [questionListId, router]);

  const handleSubmit = useCallback(async () => {
    if (!selectedQuestion || !code.trim()) return;

    setSubmitting(true);
    setSubmissionResult(null);

    try {
      const submission = await submissionsApi.submitCode({
        questionId: selectedQuestion.id,
        questionListId: questionListId,
        code: code.trim(),
        language: selectedLanguage
      });

      const newSubmission: LocalSubmission = {
        id: submission.id,
        questionId: selectedQuestion.id,
        status: submission.status.toLowerCase() as 'pending' | 'accepted' | 'error' | 'timeout',
        score: submission.score || 0,
        attempt: submissions.filter(s => s.questionId === selectedQuestion.id).length + 1,
        submittedAt: typeof submission.createdAt === 'string' ? submission.createdAt : submission.createdAt.toISOString(),
        code: submission.code,
        language: submission.language,
        feedback: undefined
      };

      setSubmissions(prev => [newSubmission, ...prev]);

      const statusLower = submission.status.toLowerCase();
      setSubmissionResult({
        status: statusLower as 'pending' | 'accepted' | 'error' | 'timeout',
        message: statusLower === 'accepted' ? 'Solução aceita!' :
          statusLower === 'error' ? 'Erro na solução' :
            statusLower === 'timeout' ? 'Tempo limite excedido' :
              'Submissão enviada com sucesso!',
        score: submission.score || 0
      });

    } catch (err) {
      setSubmissionResult({
        status: 'error',
        message: 'Erro ao enviar solução. Tente novamente.',
        score: 0
      });
    } finally {
      setSubmitting(false);
    }
  }, [selectedQuestion, code, selectedLanguage, questionListId, submissions]);

  const getQuestionSubmission = useCallback((questionId: string) => {
    return submissions
      .filter(s => s.questionId === questionId)
      .sort((a, b) => b.attempt - a.attempt)[0];
  }, [submissions]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'accepted': return 'text-green-600 bg-green-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'timeout': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }, []);

  const formatDateTime = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return `${formattedDate} às ${formattedTime}`;
  }, []);

  useEffect(() => {
    loadListData();
  }, [loadListData]);

  const reloadList = useCallback(() => {
    loadListData();
  }, [loadListData]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#questao-') && list) {
        const questionIdFromHash = hash.replace('#questao-', '');
        const question = list.questions.find(q => q.id === questionIdFromHash);
        if (question) {
          const index = list.questions.findIndex(q => q.id === questionIdFromHash);
          navigateToQuestion(question, index);
        }
      } else if (!hash && viewMode === 'question') {
        setViewMode('list');
      }
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [list, viewMode, navigateToQuestion]);

  return {
    list,
    submissions,
    selectedQuestion,
    currentQuestionIndex,
    code,
    loading,
    error,
    userRole,
    viewMode,
    submitting,
    submissionResult,
    selectedLanguage,
    navigateToQuestion,
    goBack,
    handleSubmit,
    setCode,
    setSelectedLanguage,
    getQuestionSubmission,
    getStatusColor,
    formatDateTime,
    isListStarted,
    isListEnded,
    hasQuestions,
    reloadList
  };
}
