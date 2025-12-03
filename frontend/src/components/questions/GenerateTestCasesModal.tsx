"use client";

import { useState, useRef, useEffect } from "react";
import { generateTestCases, GenerateTestCasesRequest } from "@/services/testCases";
import { questionsApi } from "@/services/questions";
import { logger } from "@/utils/logger";

interface GenerateTestCasesModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onSuccess?: () => void;
}

export default function GenerateTestCasesModal({
  isOpen,
  onClose,
  questionId,
  onSuccess,
}: GenerateTestCasesModalProps) {
  const [oracleCode, setOracleCode] = useState("");
  const [oracleLanguage, setOracleLanguage] = useState<'python' | 'java'>('python');
  const [testCaseCount, setTestCaseCount] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState(false);
  const [generatedCount, setGeneratedCount] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setOracleCode("");
      setOracleLanguage('python');
      setTestCaseCount(10);
      setGenerationError(null);
      setGenerationSuccess(false);
      setGeneratedCount(0);
      setIsGenerating(false);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    } else {
      // Quando o modal abrir, buscar a questão para obter o código oráculo salvo
      const loadQuestion = async () => {
        try {
          const question = await questionsApi.getById(questionId);
          if (question?.oracleCode) {
            setOracleCode(question.oracleCode);
            // Se houver linguagem salva, usar ela; caso contrário manter padrão
            if (question.oracleLanguage) {
              setOracleLanguage(question.oracleLanguage as 'python' | 'java');
            }
          }
        } catch (error) {
          // Silenciosamente falha se não conseguir carregar a questão
          logger.error('Erro ao carregar código oráculo salvo:', error);
        }
      };

      loadQuestion();
    }
  }, [isOpen, questionId]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleGenerate = async () => {
    if (!oracleCode.trim()) {
      setGenerationError('Por favor, insira o código oráculo');
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationSuccess(false);
    setGeneratedCount(0);

    try {
      const request: GenerateTestCasesRequest = {
        oracleCode,
        language: oracleLanguage,
        count: testCaseCount,
        use_supervision: true
      };

      const result = await generateTestCases(questionId, request, abortController.signal);

      if (abortController.signal.aborted) {
        return;
      }

      if (result.totalGenerated === 0) {
        setGenerationError('Nenhum caso de teste foi gerado. Verifique o código oráculo.');
        setIsGenerating(false);
        return;
      }

      setGeneratedCount(result.totalGenerated);
      setGenerationSuccess(true);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 2000);

    } catch (error: any) {
      if (error.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
        setIsGenerating(false);
        return;
      }

      if (error.message?.includes('Timeout') || error.message?.includes('timeout')) {
        setGenerationError(
          'A geração de casos de teste está demorando mais que o esperado. ' +
          'Os casos podem estar sendo gerados em segundo plano. ' +
          'Por favor, aguarde alguns instantes e recarregue a página para verificar se os casos foram criados.'
        );
      } else {
        setGenerationError(
          error.response?.data?.message ||
          error.message ||
          'Erro ao gerar casos de teste. Verifique o código oráculo.'
        );
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (isGenerating) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Gerar Casos de Teste</h2>
              <p className="text-sm text-slate-600 mt-0.5">Use um código oráculo para gerar casos automaticamente</p>
            </div>
          </div>
          {!isGenerating && (
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Linguagem do Oráculo
              </label>
              <select
                value={oracleLanguage}
                onChange={(e) => setOracleLanguage(e.target.value as 'python' | 'java')}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Quantidade de Casos
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={testCaseCount}
                onChange={(e) => setTestCaseCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                disabled={isGenerating}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              />
              <p className="text-xs text-slate-500 mt-1.5">Entre 1 e 100 casos</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Código Oráculo
            </label>
            <textarea
              value={oracleCode}
              onChange={(e) => setOracleCode(e.target.value)}
              disabled={isGenerating}
              placeholder={oracleLanguage === 'python'
                ? 'n = int(input())\narr = list(map(int, input().split()))\n# Seu código aqui\nprint(result)'
                : 'import java.util.*;\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Seu código aqui\n    }\n}'
              }
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-slate-50 text-slate-900 placeholder:text-slate-400 h-48 text-sm font-mono disabled:opacity-50 disabled:cursor-not-allowed transition-all resize-none"
              spellCheck={false}
            />
            <p className="text-xs text-slate-500 mt-2">
              O código deve ler da entrada padrão (stdin) e imprimir a saída esperada
            </p>
          </div>

          {generationSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900">
                    Testes gerados!
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {generatedCount} caso{generatedCount !== 1 ? 's' : ''} de teste gerado{generatedCount !== 1 ? 's' : ''} com sucesso! Fechando em instantes...
                  </p>
                </div>
              </div>
            </div>
          )}

          {generationError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-red-800 flex-1">{generationError}</p>
              </div>
            </div>
          )}

          {isGenerating && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-purple-900">Gerando casos de teste...</p>
                  <p className="text-xs text-purple-700 mt-1">Este processo pode demorar até 10 minutos. Por favor, aguarde.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isGenerating}
            className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Cancelar' : 'Fechar'}
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !oracleCode.trim() || generationSuccess}
            className="flex-1 h-12 px-4 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Gerando...
              </span>
            ) : generationSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Concluído!
              </span>
            ) : (
              'Gerar Casos de Teste'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

