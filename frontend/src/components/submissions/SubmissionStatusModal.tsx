"use client";

import { useState, useEffect } from "react";
import { submissionsApi, SubmissionDetailsResponse } from "@/services/submissions";
import { logger } from "@/utils/logger";
import { getVerdictColor } from "@/utils/statusUtils";
import { formatLanguageName } from "@/utils/languageUtils";

interface SubmissionStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  initialStatus?: string;
  initialLanguage?: string;
  initialVerdict?: string;
  code?: string;
  questionName?: string;
  userName?: string;
  questionListTitle?: string;
}

export default function SubmissionStatusModal({
  isOpen,
  onClose,
  submissionId,
  initialStatus = "pending",
  initialLanguage = "python",
  initialVerdict,
  code = "",
  questionName: initialQuestionName = "",
  userName: initialUserName = "",
  questionListTitle: initialquestionListTitle= "",
}: SubmissionStatusModalProps) {
  const [status, setStatus] = useState(initialStatus.toLowerCase());
  const [language, setLanguage] = useState(initialLanguage);
  const [createdAt, setCreatedAt] = useState<string>(new Date().toISOString());
  const [isPolling, setIsPolling] = useState(false);
  const [results, setResults] = useState<SubmissionDetailsResponse | null>(null);
  const [verdict, setVerdict] = useState<string | undefined>(initialVerdict);
  const [questionName, setQuestionName] = useState<string>(initialQuestionName);
  const [userName, setUserName] = useState<string>(initialUserName);
  const [questionListTitle, setquestionListTitle] = useState<string>(initialquestionListTitle);

  useEffect(() => {
    if (!isOpen || !submissionId) return;

    const currentStatus = status.toLowerCase();
    
    if (currentStatus === "completed" || currentStatus === "failed") {
      if (currentStatus === "completed" && !results) {
        submissionsApi.getSubmissionResults(submissionId)
          .then(submissionResults => {
            if (submissionResults) {
              setResults(submissionResults);
            }
          })
          .catch(error => {
          });
      }
      const id = setTimeout(() => setIsPolling(false), 0);
      return () => clearTimeout(id);
    }
    
    if (currentStatus === "pending" || currentStatus === "running") {
      setTimeout(() => setIsPolling(true), 0);
    }

    const pollInterval = setInterval(async () => {
      try {
        const submission = await submissionsApi.getSubmission(submissionId);
        if (!submission) return;

        const newStatus = submission.status.toLowerCase();
        setStatus(newStatus);
        setLanguage(submission.language);
        setCreatedAt(typeof submission.createdAt === 'string' ? submission.createdAt : submission.createdAt.toISOString());
        setVerdict(submission.verdict);
        setQuestionName(submission.questionName || "");
        setUserName(submission.userName || "");
        setquestionListTitle(submission.questionListTitle|| submission.questionListTitle|| "");

        if (newStatus === "completed") {
          try {
            const submissionResults = await submissionsApi.getSubmissionResults(submissionId);
            if (submissionResults) {
              setResults(submissionResults);
            }
          } catch (error) {
          }
        }

        if (newStatus !== "pending" && newStatus !== "running") {
          const id = setTimeout(() => setIsPolling(false), 0);
          clearInterval(pollInterval);
          return () => clearTimeout(id);
        }
      } catch (_error) {
        
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [isOpen, submissionId, status, results]);

  const handleClose = () => {
    setResults(null);
    onClose();
  };

  const getVerdictDotColor = (verdict?: string): string => {
    if (!verdict) return "bg-green-500";
    
    switch (verdict) {
      case "Accepted":
        return "bg-green-500";
      case "Wrong Answer":
        return "bg-orange-500";
      case "Runtime Error":
      case "Compilation Error":
      case "Presentation Error":
      case "Time Limit Exceeded":
      case "Memory Limit Exceeded":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  const getStatusInfo = () => {
    switch (status) {
      case "completed":
        return {
          icon: (
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Submissão Concluída!",
          titleColor: "text-green-600",
          description: "Seu código foi avaliado com sucesso!",
          dotColor: getVerdictDotColor(verdict),
          statusText: "Concluído",
        };
      case "failed":
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Submissão Falhou",
          titleColor: "text-red-600",
          description: "Ocorreu um erro ao avaliar seu código.",
          dotColor: "bg-red-500",
          statusText: "Falhou",
        };
      case "running":
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          title: "Processando Submissão...",
          titleColor: "text-blue-600",
          description: "Seu código está sendo executado nos casos de teste.",
          dotColor: "bg-blue-500 animate-pulse",
          statusText: "Executando",
        };
      default: 
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          title: "Submissão na Fila",
          titleColor: "text-yellow-600",
          description: "Seu código foi recebido e aguarda processamento.",
          dotColor: "bg-yellow-500 animate-pulse",
          statusText: "Pendente",
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (!isOpen) return null;

  const getHeaderGradient = () => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-green-50 to-emerald-50";
      case "failed":
        return "bg-gradient-to-r from-red-50 to-orange-50";
      case "running":
        return "bg-gradient-to-r from-blue-50 to-indigo-50";
      default:
        return "bg-gradient-to-r from-yellow-50 to-amber-50";
    }
  };

  const getHeaderIconBg = () => {
    switch (status) {
      case "completed":
        return "bg-gradient-to-br from-green-500 to-emerald-600";
      case "failed":
        return "bg-gradient-to-br from-red-500 to-orange-600";
      case "running":
        return "bg-gradient-to-br from-blue-500 to-indigo-600";
      default:
        return "bg-gradient-to-br from-yellow-500 to-amber-600";
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isPolling) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className={`flex items-center justify-between p-4 border-b border-slate-200 ${getHeaderGradient()} rounded-t-2xl`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 ${getHeaderIconBg()} rounded-xl shadow-lg`}>
              {statusInfo.icon}
            </div>
            <div>
              <h2 className={`text-xl font-bold ${statusInfo.titleColor}`}>{statusInfo.title}</h2>
              <p className="text-xs text-slate-600 mt-0.5">{statusInfo.description}</p>
            </div>
          </div>
          {!isPolling && (
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-4 max-h-[calc(85vh-100px)] overflow-y-auto">
          <div className="space-y-4">
            {(questionName || userName || questionListTitle) && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 animate-in slide-in-from-top-2 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {questionName && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Questão:</p>
                      <p className="text-sm text-slate-900 font-medium">{questionName}</p>
                    </div>
                  )}
                  {userName && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Estudante:</p>
                      <p className="text-sm text-slate-900 font-medium">{userName}</p>
                    </div>
                  )}
                  {questionListTitle && (
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-1">Lista:</p>
                      <p className="text-sm text-slate-900 font-medium">{questionListTitle}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-slate-700">Status:</p>
                  {isPolling && (
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Atualizando...
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${statusInfo.dotColor}`}></span>
                  <p className="text-xs text-slate-900 font-semibold">
                    {status === "completed" && verdict ? verdict : statusInfo.statusText}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg">
                <p className="text-xs font-semibold text-slate-700 mb-1.5">Linguagem:</p>
                <p className="text-xs text-slate-900 font-semibold">{formatLanguageName(language)}</p>
              </div>
            </div>

            <details className="bg-slate-50 border border-slate-200 p-3 rounded-lg" open={!results}>
              <summary className="text-xs font-semibold text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                Informações da Submissão
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">ID da Submissão:</p>
                  <p className="text-xs text-slate-900 font-mono break-all bg-white p-2 rounded border border-slate-200">
                    {submissionId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">Criado em:</p>
                  <p className="text-xs text-slate-900 font-medium">{new Date(createdAt).toLocaleString("pt-BR")}</p>
                </div>
                {code && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1.5">Código Submetido:</p>
                    <div className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto max-h-48 border border-slate-700">
                      <pre className="text-xs font-mono whitespace-pre-wrap break-words">{code}</pre>
                    </div>
                  </div>
                )}
              </div>
            </details>

            {results && status === "completed" && (
              <div className="space-y-3 animate-in slide-in-from-bottom-2 duration-300">
                <div
                  className={`p-4 rounded-lg border-2 shadow-sm ${
                    results.passedTests === results.totalTests
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300"
                      : "bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-slate-800">Resultado da Avaliação</h3>
                    {results.passedTests === results.totalTests ? (
                      <div className="p-1.5 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="p-1.5 bg-yellow-100 rounded-lg">
                        <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-0.5">Casos de Teste</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {results.passedTests}/{results.totalTests}
                      </p>
                      <p className="text-xs text-slate-500">casos passaram</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600 mb-0.5">Pontuação</p>
                      <p className="text-2xl font-bold text-slate-900">
                        {results.score}/100
                      </p>
                      <p className="text-xs text-slate-500">pontos obtidos</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">Detalhes dos Casos de Teste:</h4>
                
                  <div className="flex gap-2 mb-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-semibold text-green-700">
                        {results.passedTests} Passaram
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-xs font-semibold text-red-700">
                        {results.totalTests - results.passedTests} Falharam
                      </span>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {(results.testResults || []).map((result, index) => (
                      <div
                        key={result.testCaseId || index}
                        className={`p-3 rounded-lg border shadow-sm ${
                          result.passed 
                            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" 
                            : "bg-gradient-to-br from-red-50 to-orange-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900">
                            Caso de Teste {index + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-xs font-bold px-2 py-0.5 rounded ${
                                result.passed 
                                  ? "bg-green-200 text-green-800 border border-green-300" 
                                  : "bg-red-200 text-red-800 border border-red-300"
                              }`}
                            >
                              {result.passed ? "✓ Passou" : "✗ Falhou"}
                            </span>
                            <span className="text-xs text-slate-600 font-semibold">{result.verdict}</span>
                          </div>
                        </div>

                        <div className="text-xs text-slate-600 mt-1.5 flex gap-3 mb-1.5">
                          {result.executionTimeMs !== undefined && (
                            <span className="font-medium">Tempo: {result.executionTimeMs}ms</span>
                          )}
                          {result.memoryUsedKb !== undefined && (
                            <span className="font-medium">Memória: {(result.memoryUsedKb / 1024).toFixed(2)}MB</span>
                          )}
                        </div>

                        {result.actualOutput && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-slate-700 mb-1">Sua Saída:</p>
                            <pre className={`text-xs p-2 rounded font-mono overflow-x-auto max-h-20 border ${
                              result.passed 
                                ? "bg-green-100 border-green-200" 
                                : "bg-red-100 border-red-200"
                            }`}>
                              {result.actualOutput}
                            </pre>
                          </div>
                        )}

                        {result.errorMessage && (
                          <div className="mt-2">
                            <p className="text-xs font-semibold text-red-700 mb-1">Erro:</p>
                            <pre className="text-xs bg-red-100 border border-red-200 p-2 rounded font-mono overflow-x-auto max-h-24">
                              {result.errorMessage}
                            </pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
              </div>
            </div>
          )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button
            onClick={handleClose}
            disabled={isPolling}
            className="h-10 px-5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}

