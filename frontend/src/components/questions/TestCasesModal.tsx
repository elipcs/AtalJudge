"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import * as testCasesService from "@/services/testCases";
import { logger } from "@/utils/logger";
import { API } from "@/config/api";
import { TestCaseResponseDTO } from "@/types/dtos";
import GenerateTestCasesModal from "./GenerateTestCasesModal";
import ImportFromDatasetModal from "./ImportFromDatasetModal";

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  weight: number;
  order?: number;
}

interface TestCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onSave?: (testCases: TestCase[]) => void;
}

export default function TestCasesModal({
  isOpen,
  onClose,
  questionId,
  onSave,
}: TestCasesModalProps) {
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    testCaseId: string | null;
    testCaseName: string;
  }>({
    isOpen: false,
    testCaseId: null,
    testCaseName: "",
  });
  const [deleteAllConfirm, setDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  const addTimeout = useCallback((callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      callback();
      timeoutRefs.current = timeoutRefs.current.filter(id => id !== timeoutId);
    }, delay);
    timeoutRefs.current.push(timeoutId);
    return timeoutId;
  }, []);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current = [];
  }, []);

  useEffect(() => {
    if (!isOpen) {
      clearAllTimeouts();
    }
    return () => {
      clearAllTimeouts();
    };
  }, [isOpen, clearAllTimeouts]);

  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setTestCases([]);
      setError(null);
      setSaveSuccess(false);
      setIsLoading(false);
      isLoadingRef.current = false;
      hasLoadedRef.current = null;
      return;
    }

    if (!questionId) {
      setIsLoading(false);
      return;
    }

    if (hasLoadedRef.current === questionId) {
      setIsLoading(false);
      return;
    }

    if (isLoadingRef.current) {
      return;
    }

    let cancelled = false;
    isLoadingRef.current = true;
    setIsLoading(true);
    setError(null);

    const loadData = async () => {
      if (cancelled) return;

      try {
        // Buscar dados da questão com timeout
        const questionPromise = API.questions.get(questionId);
        const questionTimeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout ao carregar questão')), 10000)
        );

        const result = await Promise.race([questionPromise, questionTimeout]) as any;
        const question = result?.data;


        if (cancelled) return;

        // Buscar casos de teste
        let cases: TestCaseResponseDTO[] = [];
        try {
          logger.info(`Carregando casos de teste para questão: ${questionId}`);
          cases = await testCasesService.getTestCases(questionId);
          logger.info(`Casos de teste carregados: ${cases?.length || 0} casos`);

          // Validar que os casos são válidos
          if (!Array.isArray(cases)) {
            logger.warn('Resposta não é um array, convertendo...');
            cases = [];
          }
        } catch (loadError: any) {
          logger.error('Erro ao carregar casos de teste:', loadError);
          // Se houver erro, tentar novamente uma vez após um pequeno delay
          try {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Aguardar 1 segundo
            logger.warn('Tentando carregar casos de teste novamente...');
            cases = await testCasesService.getTestCases(questionId);
            logger.info(`Casos de teste carregados na segunda tentativa: ${cases?.length || 0} casos`);

            if (!Array.isArray(cases)) {
              cases = [];
            }
          } catch (retryError: any) {
            logger.error('Erro ao tentar carregar casos de teste novamente:', retryError);
            // Não lançar erro, apenas usar array vazio e marcar como carregado
            cases = [];
            hasLoadedRef.current = questionId; // Marcar como carregado para evitar loop
          }
        }

        if (cancelled) return;

        // Validar e mapear casos de teste
        if (Array.isArray(cases) && cases.length > 0) {
          const mappedCases = cases
            .filter(tc => tc && tc.id) // Filtrar casos inválidos
            .map((tc, index) => ({
              id: tc.id,
              input: String(tc.input || ''),
              expectedOutput: String(tc.expectedOutput || ''),
              weight: Number(tc.weight || 10),
              order: index,
            }));

          if (mappedCases.length > 0) {
            setTestCases(mappedCases);
          } else {
            // Se todos foram filtrados, criar caso vazio
            setTestCases([
              {
                id: "new-1",
                input: "",
                expectedOutput: "",
                weight: 10,
              },
            ]);
          }
        } else {
          setTestCases([
            {
              id: "new-1",
              input: "",
              expectedOutput: "",
              weight: 10,
            },
          ]);
        }

        hasLoadedRef.current = questionId;
      } catch (err: any) {
        if (!cancelled) {
          const errorMessage = err?.message?.includes('Timeout')
            ? 'A requisição demorou muito para responder. Tente recarregar a página.'
            : err?.response?.data?.message || err?.message || "Erro ao carregar casos de teste. Tente novamente.";
          setError(errorMessage);
          setTestCases([
            {
              id: "new-1",
              input: "",
              expectedOutput: "",
              weight: 10,
            },
          ]);
          hasLoadedRef.current = questionId; // Marcar como carregado mesmo com erro para evitar loop
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
          isLoadingRef.current = false;
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
      isLoadingRef.current = false;
    };
  }, [isOpen, questionId]); // Apenas isOpen e questionId como dependências

  const totalPoints = useMemo(() => {
    return testCases.reduce((sum, tc) => sum + tc.weight, 0);
  }, [testCases]);

  if (!isOpen) return null;

  const addTestCase = () => {
    const newTestCase: TestCase = {
      id: `new-${Date.now()}`,
      input: "",
      expectedOutput: "",
      weight: 10,
      order: testCases.length,
    };
    setTestCases([...testCases, newTestCase]);
  };

  const removeTestCase = async (id: string, testCaseName: string) => {
    if (testCases.length === 1) {
      setError("Deve haver pelo menos um caso de teste.");
      return;
    }

    if (id.startsWith("new-") || id.startsWith("generated-")) {
      setTestCases(testCases.filter((tc) => tc.id !== id));
      return;
    }

    setDeleteConfirm({
      isOpen: true,
      testCaseId: id,
      testCaseName,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.testCaseId) return;

    try {
      await testCasesService.deleteTestCase(questionId, deleteConfirm.testCaseId);

      setTestCases(testCases.filter((tc) => tc.id !== deleteConfirm.testCaseId));
      setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
    } catch (error: any) {
      setError(error?.message || "Erro ao remover caso de teste. Tente novamente.");
      setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, testCaseId: null, testCaseName: "" });
  };

  const removeAllTestCases = async () => {
    if (testCases.length === 0) {
      setError("Não há casos de teste para remover.");
      return;
    }

    setIsDeletingAll(true);
    setError(null);

    try {
      const savedCases = testCases.filter(tc =>
        !tc.id.startsWith("new-") && !tc.id.startsWith("generated-")
      );

      if (savedCases.length === 0) {
        setTestCases([
          {
            id: "new-1",
            input: "",
            expectedOutput: "",
            weight: 10,
          },
        ]);
        setDeleteAllConfirm(false);
        return;
      }

      const deleteResults = await Promise.allSettled(
        savedCases.map(async (tc) => {
          try {
            await testCasesService.deleteTestCase(questionId, tc.id);
            return { success: true, testCaseId: tc.id };
          } catch (error: any) {
            return { success: false, testCaseId: tc.id, error: error?.message || String(error) };
          }
        })
      );

      const succeeded: any[] = [];
      const failed: any[] = [];

      deleteResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value && result.value.success) {
          succeeded.push(result.value);
        } else {
          const testCaseId = savedCases[index]?.id || 'unknown';
          const error = result.status === 'rejected'
            ? result.reason
            : (result.status === 'fulfilled' && result.value ? result.value.error : 'Erro desconhecido');
          failed.push({ testCaseId, error });
        }
      });

      if (failed.length > 0) {
        setError(`Alguns casos de teste não puderam ser removidos (${succeeded.length}/${savedCases.length} removidos). Tente novamente.`);
      }

      hasLoadedRef.current = null;
      setIsLoading(true);
      try {
        const cases = await testCasesService.getTestCases(questionId);
        if (Array.isArray(cases) && cases.length > 0) {
          const mappedCases = cases.map((tc, index) => ({
            id: tc.id,
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            weight: tc.weight || 10,
            order: index,
          }));
          setTestCases(mappedCases);
        } else {
          setTestCases([
            {
              id: "new-1",
              input: "",
              expectedOutput: "",
              weight: 10,
            },
          ]);
        }
        hasLoadedRef.current = questionId;
      } catch (loadError: any) {
      } finally {
        setIsLoading(false);
      }

      setDeleteAllConfirm(false);

      if (failed.length === 0) {
        setSaveSuccess(true);
        addTimeout(() => {
          setSaveSuccess(false);
        }, 2000);
      }
    } catch (error: any) {
      setError(error?.message || "Erro ao remover casos de teste. Tente novamente.");

      hasLoadedRef.current = null;
      setIsLoading(true);
      try {
        const cases = await testCasesService.getTestCases(questionId);
        if (Array.isArray(cases) && cases.length > 0) {
          const mappedCases = cases.map((tc, index) => ({
            id: tc.id,
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            weight: tc.weight || 10,
            order: index,
          }));
          setTestCases(mappedCases);
        } else {
          setTestCases([
            {
              id: "new-1",
              input: "",
              expectedOutput: "",
              weight: 10,
            },
          ]);
        }
        hasLoadedRef.current = questionId;
      } catch (loadError: any) {
      } finally {
        setIsLoading(false);
      }
    } finally {
      setIsDeletingAll(false);
    }
  };

  const updateTestCase = (
    id: string,
    field: keyof TestCase,
    value: string | boolean | number
  ) => {
    setTestCases(
      testCases.map((tc) => (tc.id === id ? { ...tc, [field]: value } : tc))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSaving(true);
    setError(null);
    setSaveSuccess(false);

    try {
      const hasEmptyFields = testCases.some(
        (tc) => !tc.input.trim() || !tc.expectedOutput.trim()
      );

      if (hasEmptyFields) {
        setError("Por favor, preencha todos os campos de entrada e saída esperada.");
        setIsSaving(false);
        return;
      }

      const newCases = testCases.filter((tc) =>
        tc.id.startsWith("new-") || tc.id.startsWith("generated-")
      );
      const existingCases = testCases.filter((tc) =>
        !tc.id.startsWith("new-") && !tc.id.startsWith("generated-")
      );

      const createdIds: string[] = [];

      for (let i = 0; i < newCases.length; i++) {
        const tc = newCases[i];
        const created = await testCasesService.createTestCase(questionId, {
          questionId,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          weight: tc.weight,
          order: i,
        });
        createdIds.push(created.id);
      }

      for (let i = 0; i < existingCases.length; i++) {
        const tc = existingCases[i];
        await testCasesService.updateTestCase(questionId, tc.id, {
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          weight: tc.weight,
          order: newCases.length + i,
        });
      }

      if (onSave) {
        onSave(testCases);
      }

      setSaveSuccess(true);
      hasLoadedRef.current = null;
      setIsLoading(true);
      try {
        const cases = await testCasesService.getTestCases(questionId);
        if (Array.isArray(cases) && cases.length > 0) {
          const mappedCases = cases.map((tc, index) => ({
            id: tc.id,
            input: tc.input || '',
            expectedOutput: tc.expectedOutput || '',
            weight: tc.weight || 10,
            order: index,
          }));
          setTestCases(mappedCases);
        }
        hasLoadedRef.current = questionId;
      } catch (err: any) {
      } finally {
        setIsLoading(false);
      }

      addTimeout(() => {
        onClose();
      }, 1500);

    } catch (error: any) {
      setError(error.response?.data?.message || error?.message || "Erro ao salvar configuração. Tente novamente.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateSuccess = async () => {
    hasLoadedRef.current = null;
    setIsLoading(true);
    try {
      const cases = await testCasesService.getTestCases(questionId);
      if (Array.isArray(cases) && cases.length > 0) {
        const mappedCases = cases.map((tc, index) => ({
          id: tc.id,
          input: tc.input || '',
          expectedOutput: tc.expectedOutput || '',
          weight: tc.weight || 10,
          order: index,
        }));
        setTestCases(mappedCases);
      }
      hasLoadedRef.current = questionId;
    } catch (err: any) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
      >
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Gerenciar Casos de Teste</h2>
                <p className="text-sm text-slate-600 mt-0.5">Configure os casos de teste para avaliação</p>
              </div>
            </div>
            {!isSaving && (
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="p-6">

            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                  <p className="text-sm text-slate-600">Carregando casos de teste...</p>
                </div>
              </div>
            )}

            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800 font-semibold">Casos de teste salvos com sucesso!</p>
                </div>
              </div>
            )}

            {!isLoading && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900">Geração Automática</h3>
                          <p className="text-xs text-slate-600">Use um código oráculo para gerar casos automaticamente</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImportModal(true)}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Importar Casos
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowGenerateModal(true)}
                          disabled={isSaving}
                          className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Gerar Casos
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Casos de Teste</label>
                        <p className="text-xs text-slate-500 mt-1">
                          Configure os casos de teste que serão usados para avaliar as submissões
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {testCases.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setDeleteAllConfirm(true)}
                            disabled={isSaving || isDeletingAll}
                            className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Remover Todos
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={addTestCase}
                          disabled={isSaving}
                          className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Adicionar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {testCases.length === 0 && (
                        <div className="text-center py-12 text-slate-500">
                          <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <p className="text-sm">Nenhum caso de teste. Clique em "Adicionar" para criar um.</p>
                        </div>
                      )}
                      {testCases.map((testCase, index) => (
                        <div key={testCase.id} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-slate-700">Caso {index + 1}</span>
                            </div>
                            {testCases.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTestCase(testCase.id, `Caso de Teste ${index + 1}`)}
                                className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remover
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-2">Entrada</label>
                              <textarea
                                value={testCase.input}
                                onChange={(e) => updateTestCase(testCase.id, "input", e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 h-24 text-sm font-mono resize-none"
                                placeholder="Digite a entrada do caso de teste..."
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-slate-600 mb-2">Saída Esperada</label>
                              <textarea
                                value={testCase.expectedOutput}
                                onChange={(e) => updateTestCase(testCase.id, "expectedOutput", e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 h-24 text-sm font-mono resize-none"
                                placeholder="Digite a saída esperada..."
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-2">Pontuação</label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={testCase.weight}
                              onChange={(e) => updateTestCase(testCase.id, "weight", parseInt(e.target.value) || 0)}
                              className="w-full h-10 px-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-blue-900">
                          Pontuação Total: {totalPoints} pontos
                        </p>
                        <p className="text-xs text-blue-700 mt-0.5">
                          Distribuída entre {testCases.length} caso{testCases.length !== 1 ? 's' : ''} de teste
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                    <div className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm text-red-800 flex-1">{error}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-6 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSaving}
                    className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || saveSuccess}
                    className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed ${saveSuccess
                      ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                      }`}
                  >
                    {saveSuccess ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Salvos com sucesso!
                      </span>
                    ) : isSaving ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Salvando...
                      </span>
                    ) : (
                      "Salvar"
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div >

      {
        deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    Confirmar Exclusão
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Tem certeza que deseja remover o <span className="font-semibold">{deleteConfirm.testCaseName}</span>?
                    Esta ação não pode ser desfeita.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Sim, Remover
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {deleteAllConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  Confirmar Exclusão de Todos os Casos
                </h3>
                <p className="text-sm text-slate-600 mb-4">
                  Tem certeza que deseja remover <span className="font-semibold">todos os {testCases.length} casos de teste</span>?
                  Esta ação não pode ser desfeita. Um novo caso vazio será criado automaticamente.
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setDeleteAllConfirm(false)}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={removeAllTestCases}
                    disabled={isDeletingAll}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeletingAll ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Removendo...
                      </span>
                    ) : (
                      "Sim, Remover Todos"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
      }

      <GenerateTestCasesModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        questionId={questionId}
        onSuccess={handleGenerateSuccess}
      />

      <ImportFromDatasetModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        questionId={questionId}
        onSuccess={handleGenerateSuccess}
      />
    </>
  );
}
