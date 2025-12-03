"use client";

import { useState, useEffect } from "react";
import { post } from "@/config/api";
import { logger } from "@/utils/logger";
import { useToast } from "@/hooks/use-toast";

interface ImportQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ImportQuestionsModal({
  isOpen,
  onClose,
  onSuccess,
}: ImportQuestionsModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState("1x");

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
    }
  }, [isOpen]);

  const handleImportDataset = async () => {
    setIsLoading(true);

    try {
      // Enviar requisição para importar todo o dataset em background
      await post<any>("/questions/bulk-import-dataset", {
        datasetConfig: config,
        skipExisting: true,
        includeAllTestCases: true,
      });

      toast({
        title: "Importação Iniciada",
        description: "O dataset está sendo importado em background. Você será notificado quando terminar.",
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err: any) {
      logger.error("Error starting dataset import:", err);
      const errorMsg = err.response?.data?.message || err.message || "Erro ao iniciar importação";
      toast({
        title: "Erro",
        description: errorMsg,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in zoom-in-95 duration-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl shadow-lg">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Importar Dataset</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                ByteDance-Seed/Code-Contests-Plus
              </p>
            </div>
          </div>
          {!isLoading && (
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Banner */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 text-sm">Processo Demorado</h3>
                <p className="text-xs text-amber-800 mt-1">
                  O download e importação do dataset ocorrerá em background. Pode levar vários minutos. Você será notificado quando terminar.
                </p>
              </div>
            </div>
          </div>

          {/* Dataset Info */}
          <div className="space-y-3">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h3 className="font-semibold text-slate-900 text-sm mb-2">Dados do Dataset</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p>
                  <span className="font-semibold text-slate-700">Fonte:</span> Code-Contests-Plus
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Organização:</span> ByteDance-Seed
                </p>
                <p>
                  <span className="font-semibold text-slate-700">Configuração:</span> {config} (casos de teste)
                </p>
              </div>
            </div>
          </div>

          {/* Config Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700">
              Quantidade de Casos de Teste
            </label>
            <select
              value={config}
              onChange={(e) => setConfig(e.target.value)}
              disabled={isLoading}
              className="w-full h-11 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 font-semibold"
            >
              <option value="1x">1x (~25 casos por questão)</option>
              <option value="2x">2x (~44 casos por questão)</option>
              <option value="3x">3x (~62 casos por questão) - Recomendado</option>
            </select>
            <p className="text-xs text-slate-500">
              Mais casos = mais tempo de importação
            </p>
          </div>


        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleImportDataset}
            disabled={isLoading}
            className="flex-1 h-11 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Iniciando Importação...
              </span>
            ) : (
              "Importar Todo o Dataset"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
