"use client";

import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/config/api";

interface ImportTestCasesFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  onSuccess?: () => void;
}

interface TestCasePreview {
  input: string;
  output: string;
}

export default function ImportTestCasesFileModal({
  isOpen,
  onClose,
  questionId,
  onSuccess,
}: ImportTestCasesFileModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<TestCasePreview[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'json' && fileExtension !== 'csv') {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo JSON ou CSV",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "O arquivo não pode ser maior que 5MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    // Parse and preview
    try {
      const content = await selectedFile.text();
      let parsedData: TestCasePreview[] = [];

      if (fileExtension === 'json') {
        parsedData = JSON.parse(content);
        
        // Validate JSON structure
        if (!Array.isArray(parsedData)) {
          throw new Error("O arquivo JSON deve conter um array");
        }

        // Validate each test case
        parsedData.forEach((tc, index) => {
          if (!tc.input || !tc.output) {
            throw new Error(`Caso de teste ${index + 1} está incompleto. Campos 'input' e 'output' são obrigatórios.`);
          }
        });

      } else if (fileExtension === 'csv') {
        // Simple CSV parser
        const lines = content.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
          throw new Error("O arquivo CSV deve conter pelo menos o cabeçalho e uma linha de dados");
        }

        const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        
        // Validate header
        if (!header.includes('input') || !header.includes('output')) {
          throw new Error("O CSV deve conter as colunas 'input' e 'output'");
        }

        const inputIndex = header.indexOf('input');
        const outputIndex = header.indexOf('output');

        // Parse data rows
        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length > inputIndex && values.length > outputIndex) {
            parsedData.push({
              input: values[inputIndex],
              output: values[outputIndex],
            });
          }
        }
      }

      if (parsedData.length === 0) {
        throw new Error("Nenhum caso de teste válido encontrado no arquivo");
      }

      setPreview(parsedData);
      setShowPreview(true);
    } catch (error: any) {
      toast({
        title: "Erro ao processar arquivo",
        description: error.message || "Formato de arquivo inválido",
        variant: "destructive",
      });
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Simple CSV line parser that handles quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    result.push(current.trim());
    return result;
  };

  const handleImport = async () => {
    if (!file) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await API.testCases.importFromFile(questionId, formData);

      toast({
        title: "Sucesso",
        description: `${response.imported} caso(s) de teste importado(s) com sucesso!`,
      });

      if (onSuccess) {
        onSuccess();
      }

      handleClose();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao importar casos de teste",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview([]);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl animate-in zoom-in-95 duration-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Importar Casos de Teste</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Envie um arquivo JSON ou CSV
              </p>
            </div>
          </div>
          {!isLoading && (
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {!showPreview ? (
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Selecione o arquivo
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="p-4 bg-emerald-100 rounded-full">
                      <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Clique para selecionar um arquivo
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        JSON ou CSV (máx. 5MB)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Format Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">Formato esperado</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">JSON:</p>
                    <pre className="text-xs bg-white p-2 rounded border border-blue-200 overflow-x-auto">
{`[
  {
    "input": "entrada 1",
    "output": "saída 1"
  },
  {
    "input": "entrada 2",
    "output": "saída 2"
  }
]`}
                    </pre>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-800 mb-1">CSV:</p>
                    <pre className="text-xs bg-white p-2 rounded border border-blue-200 overflow-x-auto">
{`input,output
"entrada 1","saída 1"
"entrada 2","saída 2"`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Preview Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Preview dos Casos de Teste
                  </h3>
                  <p className="text-sm text-slate-600">
                    {preview.length} caso(s) de teste encontrado(s)
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowPreview(false);
                    setFile(null);
                    setPreview([]);
                    if (fileInputRef.current) {
                      fileInputRef.current.value = '';
                    }
                  }}
                  className="text-sm text-slate-600 hover:text-slate-800 font-medium"
                >
                  Escolher outro arquivo
                </button>
              </div>

              {/* Preview List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {preview.slice(0, 10).map((tc, index) => (
                  <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="text-xs font-semibold text-slate-600 mb-2">Caso {index + 1}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Input:</div>
                        <div className="text-sm text-slate-900 font-mono bg-white p-2 rounded border border-slate-200 break-all max-h-20 overflow-y-auto">
                          {tc.input}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-500 mb-1">Output:</div>
                        <div className="text-sm text-slate-900 font-mono bg-white p-2 rounded border border-slate-200 break-all max-h-20 overflow-y-auto">
                          {tc.output}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {preview.length > 10 && (
                  <div className="text-center text-sm text-slate-500 py-2">
                    ... e mais {preview.length - 10} caso(s)
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="flex-1 h-11 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          {showPreview && (
            <button
              type="button"
              onClick={handleImport}
              disabled={isLoading || !file}
              className="flex-1 h-11 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:ring-emerald-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Importando...
                </span>
              ) : (
                `Importar ${preview.length} Caso(s)`
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
