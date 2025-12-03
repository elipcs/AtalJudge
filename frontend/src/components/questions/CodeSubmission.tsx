"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dropdown } from "@/components/ui/dropdown";
import TestCasesModal from "./TestCasesModal";
import SubmissionStatusModal from "../submissions/SubmissionStatusModal";
import { UserRole } from "@/types";
import { submissionsApi, SubmissionResultsResponse } from "@/services/submissions";
import { logger } from "@/utils/logger";

interface CodeSubmissionProps {
  questionId: string;
  questionListId: string;
  userRole?: UserRole;
  onSubmit?: (code: string, language: string) => void;
  questionName?: string;
  questionListTitle?: string;
}

export default function CodeSubmission({
  questionId,
  questionListId,
  userRole,
  onSubmit,
  questionName,
  questionListTitle,
}: CodeSubmissionProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTestCasesModalOpen, setIsTestCasesModalOpen] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<string>("pending");
  const [submissionLanguage, setSubmissionLanguage] = useState<string>("python");
  const [submittedCode, setSubmittedCode] = useState<string>("");
  const [result, setResult] = useState<{
    status: "success" | "error" | "partial" | "running";
    message: string;
    details?: string;
    resultsData?: SubmissionResultsResponse;
  } | null>(null);

  const isProfessorOrMonitor = userRole === "professor" || userRole === "assistant";

  const handleSubmit = async () => {
    if (!code.trim()) {
      setResult({
        status: "error",
        message: "Por favor, insira algum código antes de enviar.",
      });
      return;
    }

    setIsSubmitting(true);
    setResult(null);
    setSubmissionId(null);

    try {
      const submission = await submissionsApi.submitCode({
        questionId: questionId,
        questionListId: questionListId,
        language: language,
        code: code,
      });

      if (submission && submission.id) {
        setSubmissionId(submission.id);
        setSubmissionStatus(submission.status);
        setSubmissionLanguage(submission.language);
        setSubmittedCode(code);
        setShowSubmissionModal(true);

        if (onSubmit) {
          onSubmit(code, language);
        }
      } else {
        throw new Error("Resposta inválida do servidor: submissão sem ID");
      }
    } catch (error: any) {
      setResult({
        status: "error",
        message: "Erro ao submeter código",
        details: error.response?.data?.message || error.message || "Erro desconhecido",
      });
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setCode("");
    setResult(null);
  };

  const getResultColor = () => {
    if (!result) return "";
    switch (result.status) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "partial":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "running":
        return "bg-blue-50 border-blue-200 text-blue-800";
      default:
        return "";
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    switch (result.status) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-red-600"
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
        );
      case "partial":
        return (
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
    }
  };

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 h-full flex flex-col">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Submissão de Código
            </h3>
            <p className="text-sm text-slate-600">
              Escreva sua solução e envie para avaliação
            </p>
          </div>
          {isProfessorOrMonitor && (
            <Button
              onClick={() => setIsTestCasesModalOpen(true)}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-xl font-semibold transition-all duration-200"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Configurar Casos de Teste
            </Button>
          )}
        </div>
      </div>

      { }
      <div className="mb-4">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Linguagem de Programação
        </label>
        <Dropdown
          value={language}
          onChange={setLanguage}
          options={[
            { value: "python", label: "Python" },
            { value: "java", label: "Java" }
          ]}
          placeholder="Selecione a linguagem"
          className="w-full"
        />
      </div>

      { }
      <div className="mb-4 flex-1 flex flex-col">
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Seu Código
        </label>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={
            language === "python"
              ? "# Escreva seu código Python aqui\ndef main():\n    pass\n\nif __name__ == '__main__':\n    main()"
              : "// Escreva seu código Java aqui\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}"
          }
          className="flex-1 min-h-[300px] w-full p-4 font-mono text-sm bg-slate-900 text-slate-200 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          spellCheck={false}
        />
      </div>

      { }
      {result && (
        <div
          className={`mb-4 p-4 rounded-xl border ${getResultColor()} transition-all duration-300`}
        >
          <div className="flex items-start gap-3">
            {getResultIcon()}
            <div className="flex-1">
              <p className="font-semibold mb-1">{result.message}</p>
              {result.details && (
                <p className="text-sm opacity-90">{result.details}</p>
              )}

              { }
              {result.resultsData && (
                <div className="mt-4 space-y-2">
                  <div className="text-xs font-semibold text-slate-700">
                    Resultados por caso de teste:
                  </div>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {result.resultsData.results.map((testResult, idx) => (
                      <div
                        key={testResult.id}
                        className={`text-xs p-2 rounded ${testResult.passed
                          ? "bg-green-50 text-green-800"
                          : "bg-red-50 text-red-800"
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">
                            Caso {idx + 1} {testResult.testCaseName ? `(${testResult.testCaseName})` : ""}
                          </span>
                          <span className="font-semibold">
                            {testResult.passed ? "✓ Passou" : "✗ Falhou"} ({testResult.pointsAwarded} pts)
                          </span>
                        </div>
                        {testResult.executionTimeMs && (
                          <div className="text-xs opacity-75 mt-1">
                            Tempo: {testResult.executionTimeMs}ms |
                            Memória: {testResult.memoryKb ? `${Math.round(testResult.memoryKb / 1024)}MB` : "N/A"}
                          </div>
                        )}
                        {!testResult.passed && testResult.stderr && (
                          <div className="text-xs mt-1 font-mono bg-red-100 p-1 rounded">
                            {testResult.stderr.substring(0, 100)}
                            {testResult.stderr.length > 100 && "..."}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      { }
      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Enviar Solução
        </Button>
        <Button
          onClick={handleClear}
          disabled={isSubmitting}
          variant="outline"
          className="border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpar
        </Button>
      </div>

      { }
      <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
        <p className="text-xs text-blue-800">
          <span className="font-semibold">Dica:</span> Seu código será
          testado contra múltiplos casos de teste. Certifique-se de seguir o
          formato de entrada e saída especificado.
        </p>
      </div>

      { }
      {isTestCasesModalOpen && (
        <TestCasesModal
          isOpen={isTestCasesModalOpen}
          onClose={() => setIsTestCasesModalOpen(false)}
          questionId={questionId}
          onSave={() => {
          }}
        />
      )}

      {submissionId && (
        <SubmissionStatusModal
          isOpen={showSubmissionModal}
          onClose={() => setShowSubmissionModal(false)}
          submissionId={submissionId}
          initialStatus={submissionStatus}
          initialLanguage={submissionLanguage}
          code={submittedCode}
          questionName={questionName}
          questionListTitle={questionListTitle}
        />
      )}
    </Card>
  );
}
