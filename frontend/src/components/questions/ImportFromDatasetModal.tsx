"use client";

import { useState, useEffect } from "react";
import { get, post } from "@/config/api";
import { logger } from "@/utils/logger";

interface DatasetProblem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  time_limit: number;
  memory_limit: number;
  tags: string[];
  source: string;
  config: string;
}

interface DatasetTestCase {
  input: string;
  expectedOutput: string;
  weight: number;
  isExample: boolean;
}

interface ImportFromDatasetModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onSuccess?: () => void;
}

export default function ImportFromDatasetModal({
  isOpen,
  onClose,
  questionId,
  onSuccess,
}: ImportFromDatasetModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [config, setConfig] = useState("1x");
  const [searchResults, setSearchResults] = useState<DatasetProblem[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<DatasetProblem | null>(null);
  const [testCasesPreview, setTestCasesPreview] = useState<DatasetTestCase[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"search" | "preview">("search");

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setSearchQuery("");
      setSearchResults([]);
      setSelectedProblem(null);
      setTestCasesPreview([]);
      setError(null);
      setStep("search");
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError("Digite um termo de busca");
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResults([]);

    try {
      const response = await get<{ data: DatasetProblem[] }>(`/dataset/search?query=${encodeURIComponent(searchQuery)}&config=${config}&limit=20`);

      setSearchResults(response.data?.data || []);
      
      if (response.data.data.length === 0) {
        setError("Nenhuma questão encontrada com esse termo");
      }
    } catch (err: any) {
      logger.error("Error searching dataset:", err);
      setError(
        err.message ||
          "Erro ao buscar no dataset. Verifique se o serviço está rodando."
      );
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProblem = async (problem: DatasetProblem) => {
    setSelectedProblem(problem);
    setIsLoadingPreview(true);
    setError(null);

    try {
      const response = await get<{ data: DatasetTestCase[] }>(
        `/dataset/problem/${problem.id}/testcases?config=${problem.config}&limit=10`
      );

      setTestCasesPreview(response.data?.data || []);
      setStep("preview");
    } catch (err: any) {
      logger.error("Error loading test cases preview:", err);
      setError("Erro ao carregar preview dos casos de teste");
      setSelectedProblem(null);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleImport = async () => {
    if (!selectedProblem) return;

    setIsImporting(true);
    setError(null);

    try {
      const response = await post<{ data: DatasetTestCase[] }>(
        `/questions/${questionId}/testcases/import-from-dataset`,
        {
          datasetProblemId: selectedProblem.id,
          config: selectedProblem.config,
          testCasesToImport: testCasesPreview.length,
        }
      );

      logger.info("Test cases imported successfully");
      
      if (onSuccess) {
        onSuccess();
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      logger.error("Error importing test cases:", err);
      setError(
        err.message || "Erro ao importar casos de teste"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleBack = () => {
    setStep("search");
    setSelectedProblem(null);
    setTestCasesPreview([]);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Importar Casos do Dataset
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {step === "search"
                  ? "Busque questões no Code-Contests-Plus"
                  : "Preview dos casos de teste"}
              </p>
            </div>
          </div>
          {!isImporting && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          {step === "search" && (
            <div className="space-y-6">
              {/* Search Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Buscar Questão
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Digite palavras-chave (ex: graph, sorting, dp...)"
                      className="flex-1 h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900"
                      disabled={isSearching}
                    />
                    <select
                      value={config}
                      onChange={(e) => setConfig(e.target.value)}
                      className="h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-900"
                      disabled={isSearching}
                    >
                      <option value="1x">1x (~25 casos)</option>
                      <option value="2x">2x (~44 casos)</option>
                      <option value="3x">3x (~62 casos)</option>
                      <option value="4x">4x (~80 casos)</option>
                      <option value="5x">5x (~98 casos)</option>
                    </select>
                    <button
                      onClick={handleSearch}
                      disabled={isSearching || !searchQuery.trim()}
                      className="h-12 px-6 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSearching ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Buscando...
                        </>
                      ) : (
                        <>
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                          </svg>
                          Buscar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-3">
                    Resultados ({searchResults.length})
                  </h3>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {searchResults.map((problem) => (
                      <div
                        key={problem.id}
                        onClick={() => handleSelectProblem(problem)}
                        className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 mb-1">
                              {problem.title}
                            </h4>
                            <p className="text-sm text-slate-600 line-clamp-2 mb-2">
                              {problem.description}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                {problem.difficulty}
                              </span>
                              <span className="text-xs text-slate-500">
                                {problem.time_limit}ms
                              </span>
                              <span className="text-xs text-slate-500">
                                {problem.memory_limit}MB
                              </span>
                              {problem.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 text-xs bg-slate-200 text-slate-700 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                          <svg
                            className="w-5 h-5 text-slate-400 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {step === "preview" && selectedProblem && (
            <div className="space-y-6">
              {/* Back button */}
              <button
                onClick={handleBack}
                disabled={isImporting}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Voltar para busca
              </button>

              {/* Problem details */}
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <h3 className="font-bold text-lg text-slate-900 mb-2">
                  {selectedProblem.title}
                </h3>
                <p className="text-sm text-slate-600 mb-3">
                  {selectedProblem.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                    {selectedProblem.difficulty}
                  </span>
                  <span className="text-xs text-slate-500">
                    Config: {selectedProblem.config}
                  </span>
                </div>
              </div>

              {/* Test cases preview */}
              {isLoadingPreview ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-200 border-t-emerald-600"></div>
                    <p className="text-sm text-slate-600">
                      Carregando casos de teste...
                    </p>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-sm font-semibold text-slate-700 mb-3">
                    Preview dos Casos de Teste ({testCasesPreview.length})
                  </h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {testCasesPreview.map((tc, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border border-slate-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold text-slate-700">
                            Caso {idx + 1}
                          </span>
                          {tc.isExample && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                              Exemplo
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Entrada
                            </label>
                            <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto font-mono">
                              {tc.input}
                            </pre>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                              Saída
                            </label>
                            <pre className="text-xs bg-slate-50 p-2 rounded border border-slate-200 overflow-x-auto font-mono">
                              {tc.expectedOutput}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-start gap-2">
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm text-red-800 flex-1">{error}</p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-200">
            <button
              type="button"
              onClick={step === "preview" ? handleBack : onClose}
              disabled={isImporting}
              className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === "preview" ? "Voltar" : "Cancelar"}
            </button>
            {step === "preview" && selectedProblem && (
              <button
                type="button"
                onClick={handleImport}
                disabled={isImporting || testCasesPreview.length === 0}
                className="flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
              >
                {isImporting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Importando...
                  </span>
                ) : (
                  `Importar ${testCasesPreview.length} Casos`
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
