"use client";


import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageLoading from "@/components/PageLoading";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { useListPage } from "@/hooks/useListPage";
import ListTabs from "@/components/lists/ListTabs";
import QuestionTabs from "@/components/questions/QuestionTabs";
import CodeSubmission from "@/components/questions/CodeSubmission";
import { logger } from '@/utils/logger';

export default function QuestionsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;

  const {
    list,
    loading,
    error,
    formatDateTime,
    hasQuestions,
    userRole,
    isListStarted,
    isListEnded
  } = useListPage();

  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);

  const getOrderedQuestions = () => {
    if (!list || list.scoringMode !== 'groups' || !list.questionGroups || list.questionGroups.length === 0) {
      return list?.questions || [];
    }

    const orderedQuestions: any[] = [];
    const questionMap = new Map(list.questions.map(q => [q.id, q]));

    for (const group of list.questionGroups) {
      if (!group || !group.questionIds) continue;
      const questionIds = Array.isArray(group.questionIds) ? group.questionIds : [];
      for (const questionId of questionIds) {
        const question = questionMap.get(questionId);
        if (question && !orderedQuestions.find(q => q.id === question.id)) {
          orderedQuestions.push(question);
        }
      }
    }

    for (const question of list.questions) {
      if (!orderedQuestions.find(q => q.id === question.id)) {
        orderedQuestions.push(question);
      }
    }

    return orderedQuestions;
  };

  const orderedQuestions = getOrderedQuestions();

  const queryQuestionIndex = useMemo(() => {
    const qParam = searchParams.get('q');
    if (qParam === null || orderedQuestions.length === 0) return null;
    const idx = parseInt(qParam, 10);
    if (Number.isNaN(idx)) return null;
    if (idx < 0 || idx >= orderedQuestions.length) return null;
    return idx;
  }, [searchParams, orderedQuestions.length]);

  useEffect(() => {
    if (queryQuestionIndex !== null && queryQuestionIndex !== activeQuestionIndex) {
      const id = setTimeout(() => setActiveQuestionIndex(queryQuestionIndex), 0);
      return () => clearTimeout(id);
    }
  }, [queryQuestionIndex, activeQuestionIndex]);

  if (loading) {
    return <PageLoading message="Carregando questões..." description="Preparando as informações" />;
  }

  if (error && error !== 'ipRestricted') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              Erro ao carregar questões
            </h1>
            <p className="text-slate-600 mb-8 text-lg">
              {error}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/listas">
                <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Voltar às Listas
                </Button>
              </Link>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-xl font-semibold transition-all duration-200"
              >
                Tentar Novamente
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              Lista não encontrada
            </h1>
            <p className="text-slate-600 mb-8 text-lg">
              A lista solicitada não foi encontrada ou você não tem permissão para acessá-la.
            </p>
            <Link href="/listas">
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Voltar às Listas
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!hasQuestions()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200 rounded-2xl shadow-lg p-8 text-center">
          <div className="p-4 bg-slate-100 rounded-xl mx-auto mb-6 w-fit">
            <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-700 mb-2">Nenhuma questão disponível</h3>
          <p className="text-slate-600">
            Esta lista ainda não possui questões cadastradas.
          </p>
        </Card>
      </div>
    );
  }

  const questionLabels = orderedQuestions.map((_, idx) => String.fromCharCode(65 + idx));
  const activeIndex = activeQuestionIndex;
  const activeQuestion = orderedQuestions[activeIndex];

  if (userRole === 'student' && !isListStarted()) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 rounded-3xl shadow-lg p-8 text-center">
            <div className="p-4 bg-amber-100 rounded-xl mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-4">
              Lista ainda não começou
            </h1>
            <p className="text-slate-600 mb-2 text-lg">
              Esta lista começará em:
            </p>
            <p className="text-amber-700 font-semibold mb-8 text-lg">
              {list?.startDate ? formatDateTime(list.startDate) : 'Data não definida'}
            </p>
            <p className="text-slate-600 mb-8">
              O acesso às questões será liberado automaticamente na data e hora de início.
            </p>
            <Link href="/listas">
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-slate-900 px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Voltar às Listas
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const goToQuestion = (idx: number) => {
    setActiveQuestionIndex(idx);
    router.push(`/listas/${id}/questoes?q=${idx}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      { }
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <Link href={`/listas/${id}`}>
            <Button variant="outline" size="sm" className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl">
              ← Voltar
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {list.title}
            </h1>
            <p className="text-slate-600 mt-1">Questão {questionLabels[activeIndex]}</p>
          </div>
        </div>

        { }
        <ListTabs id={id} activeTab="questoes" hasQuestions={!!hasQuestions()} userRole={userRole || 'student'} />
      </div>

      { }
      {error === 'ipRestricted' && (
        <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-xl">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800">Acesso Restrito por IP</h3>
              <p className="text-red-700">
                Esta lista possui restrição de acesso por IP. Seu endereço IP atual não está autorizado para visualizar o conteúdo desta lista. Entre em contato com seu professor para mais informações.
              </p>
            </div>
          </div>
        </Card>
      )}

      { }
      {error !== 'ipRestricted' && (
        <QuestionTabs
          labels={questionLabels}
          activeIndex={activeIndex}
          onSelect={(idx) => goToQuestion(idx)}
          userRole={userRole || 'student'}
        />
      )}

      { }
      {error !== 'ipRestricted' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          { }
          <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  {questionLabels[activeIndex]}. {activeQuestion.title}
                </h2>

                { }
                {list.scoringMode === 'groups' && list.questionGroups && (() => {
                  const group = list.questionGroups.find(g => {
                    if (!g || !g.questionIds) return false;
                    const qids = Array.isArray(g.questionIds) ? g.questionIds : [];
                    return qids.includes(activeQuestion.id);
                  });
                  return group ? (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full border border-blue-200">
                      {group.name}
                    </span>
                  ) : null;
                })()}
              </div>

              { }
              {activeQuestion.text && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Enunciado</h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <MarkdownRenderer content={activeQuestion.text} />
                  </div>
                </div>
              )}

              { }
              {activeQuestion.examples && activeQuestion.examples.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">Exemplos</h3>
                  <div className="space-y-4">
                    {activeQuestion.examples.map((example: { input: string; output: string }, idx: number) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm font-semibold text-slate-600 mb-3">Exemplo {idx + 1}:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2">Entrada:</p>
                            <pre className="bg-white rounded-lg p-3 text-sm text-slate-800 font-mono border border-slate-200 overflow-x-auto">
                              {example.input}
                            </pre>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-600 mb-2">Saída:</p>
                            <pre className="bg-white rounded-lg p-3 text-sm text-slate-800 font-mono border border-slate-200 overflow-x-auto">
                              {example.output}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              { }
            </div>
          </Card>

          { }
          {!(userRole === 'student' && !isListStarted()) && !(userRole === 'student' && isListEnded()) && (
            <CodeSubmission
              questionId={activeQuestion.id}
              questionListId={id}
              userRole="professor"
              questionName={activeQuestion.title}
              questionListTitle={list?.title}
              onSubmit={(code, language) => {
              }}
            />
          )}

          { }
          {userRole === 'student' && isListEnded() && (
            <Card className="bg-gradient-to-r from-red-50 to-pink-50 border-red-200 rounded-3xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900">Prazo finalizado</h3>
                  <p className="text-red-800 mt-1">
                    O prazo para submeter soluções nesta lista já terminou em {list?.endDate ? formatDateTime(list.endDate) : 'data não definida'}. Você pode visualizar as questões mas não é possível enviar novas submissões.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
