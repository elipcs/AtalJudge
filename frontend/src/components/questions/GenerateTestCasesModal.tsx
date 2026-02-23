"use client";

import { useState } from "react";
import CodeEditor from "./../ui/CodeEditor";
import { generateTestCasesOracle } from "@/services/testCases";
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
  const [language, setLanguage] = useState<'python' | 'java'>('python');
  const [oracleCode, setOracleCode] = useState("");
  const [inputs, setInputs] = useState<string[]>([""]);
  const [defaultWeight, setDefaultWeight] = useState<number>(10);
  const [defaultIsHidden, setDefaultIsHidden] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddInput = () => {
    setInputs([...inputs, ""]);
  };

  const handleRemoveInput = (index: number) => {
    if (inputs.length === 1) return;
    const newInputs = [...inputs];
    newInputs.splice(index, 1);
    setInputs(newInputs);
  };

  const handleUpdateInput = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value;
    setInputs(newInputs);
  };

  const currentLineCount = oracleCode.split("\n").length;
  // Make editor grow dynamically with a min/max limit
  const editorHeight = Math.min(Math.max(150, currentLineCount * 24 + 40), 400);

  const handleSubmit = async () => {
    setError(null);
    setSuccessMsg(null);
    const validInputs = inputs.filter(i => i.trim() !== "");

    if (!oracleCode.trim()) {
      setError("O código oráculo não pode estar vazio.");
      return;
    }

    if (validInputs.length === 0) {
      setError("Adicione pelo menos uma entrada válida.");
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateTestCasesOracle(questionId, {
        oracleCode,
        language,
        inputs: validInputs,
        defaultWeight,
        defaultIsHidden,
      });

      if (result.createdTestCases.length > 0) {
        setSuccessMsg(`Gerados com sucesso: ${result.createdTestCases.length} casos.`);
        if (onSuccess) {
          // Pequeno delay para exibir a mensagem e depois fechar e atualizar
          setTimeout(() => {
            onSuccess();
            onClose();
          }, 1500);
        }
      }

      if (result.failedExecutions.length > 0) {
        setError(`Falha em ${result.failedExecutions.length} caso(s). O primeiro erro: ${result.failedExecutions[0].error}`);
      }
    } catch (err: any) {
      logger.error("Erro ao gerar casos de teste via oráculo:", err);
      setError(err.message || "Ocorreu um erro ao gerar os casos de teste.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isGenerating) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Gerar Casos de Teste (Oráculo)</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1 font-sans text-sm text-slate-700 space-y-6 bg-slate-50/50">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-3 shadow-sm">
              <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1 whitespace-pre-wrap">{error}</div>
            </div>
          )}

          {successMsg && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl flex items-center gap-3 shadow-sm">
              <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium">{successMsg}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 h-full">
              {/* Esquerda: Configuração e Código */}
              <div className="flex-1 space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Linguagem do Oráculo</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as any)}
                      className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-white"
                      disabled={isGenerating}
                    >
                      <option value="python">Python</option>
                      <option value="java">Java</option>
                    </select>
                  </div>
                  <div className="w-32">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Peso Padrão</label>
                    <input
                      type="number"
                      min="0"
                      value={defaultWeight}
                      onChange={(e) => setDefaultWeight(Number(e.target.value))}
                      className="w-full rounded-xl border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="10"
                      disabled={isGenerating}
                    />
                  </div>
                  <div className="w-32 flex flex-col justify-end pb-1.5">
                    <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                      <input
                        type="checkbox"
                        checked={defaultIsHidden}
                        onChange={(e) => setDefaultIsHidden(e.target.checked)}
                        disabled={isGenerating}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                      />
                      <span>Ocultos?</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-slate-700">Código do Oráculo</label>
                  <p className="text-xs text-slate-500 mb-2">Escreva o código fonte que gera a saída correta para as entradas fornecidas. Pode ler da entrada padrão.</p>
                  <div className="border border-slate-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 bg-white shadow-inner">
                    <CodeEditor
                      value={oracleCode}
                      onChange={setOracleCode}
                      language={language}
                      minHeight={`${editorHeight}px`}
                      placeholder={`Escreva seu código ${language.toUpperCase()} aqui...`}
                    />
                  </div>
                </div>
              </div>

              {/* Direita: Entradas para os casos */}
              <div className="w-full md:w-80 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-semibold text-slate-700">Entradas (Inputs)</label>
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">
                    {inputs.length} {inputs.length === 1 ? 'caso' : 'casos'}
                  </span>
                </div>

                <div className="flex-1 min-h-[300px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner flex flex-col">
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50">
                    {inputs.map((input, idx) => (
                      <div key={idx} className="relative group bg-white p-2 rounded-xl border border-slate-200 shadow-sm focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-400 transition-all">
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {inputs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveInput(idx)}
                              disabled={isGenerating}
                              className="text-red-400 hover:text-red-600 p-1 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                              title="Remover Entrada"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <label className="block text-xs font-medium text-slate-500 mb-1.5 ml-1">Entrada #{idx + 1}</label>
                        <textarea
                          className="w-full border-none focus:ring-0 p-1.5 text-sm resize-none"
                          rows={3}
                          placeholder="Ex: 5 10&#10;A B"
                          value={input}
                          onChange={(e) => handleUpdateInput(idx, e.target.value)}
                          disabled={isGenerating}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-white border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleAddInput}
                      disabled={isGenerating}
                      className="w-full px-4 py-2 border-2 border-dashed border-slate-300 text-slate-600 rounded-lg hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Adicionar Nova Entrada
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors shadow-sm disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isGenerating}
            className="flex-1 h-12 px-4 text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Gerando Casos...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Gerar Casos e Salvar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
