import React from 'react';

import { Question } from '../../types';
import MarkdownRenderer from '../MarkdownRenderer';

interface SubmissionResult {
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  message: string;
}

interface QuestionViewProps {
  question: Question;
  code: string;
  setCode: (code: string) => void;
  selectedLanguage: 'python' | 'java';
  handleLanguageChange: (lang: 'python' | 'java') => void;
  handleSubmitCode: () => void;
  submitting: boolean;
  submissionResult: SubmissionResult | null;
  handleNavigateQuestion: (dir: 'prev' | 'next') => void;
  currentQuestionIndex: number;
  totalQuestions: number;
  onViewReferenceCode: (question: Question) => void;
  onViewTestCases: (question: Question) => void;
}

export default function QuestionView({
  question,
  code,
  setCode,
  selectedLanguage,
  handleLanguageChange,
  handleSubmitCode,
  submitting,
  submissionResult,
  handleNavigateQuestion,
  currentQuestionIndex,
  totalQuestions,
  onViewReferenceCode,
  onViewTestCases
}: QuestionViewProps) {
  if (!question) return null;
  return (
    <div className="space-y-6">
      {}
      <div className="flex items-center justify-between bg-white/70 p-4 rounded shadow border border-slate-200">
        <button
          className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          onClick={() => handleNavigateQuestion('prev')}
          disabled={currentQuestionIndex === 0}
        >Anterior</button>
        <span className="font-medium text-slate-700">
          Questão {currentQuestionIndex + 1} de {totalQuestions}
        </span>
        <button
          className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
          onClick={() => handleNavigateQuestion('next')}
          disabled={currentQuestionIndex === totalQuestions - 1}
        >Próxima</button>
      </div>

      {}
      <div className="bg-white/70 p-6 rounded shadow border border-slate-200">
        <h2 className="text-xl font-bold mb-2 text-blue-800">{question.title}</h2>
        <div className="text-slate-800">
          <MarkdownRenderer content={question.text} />
        </div>
        <div className="flex gap-2 mt-2">
          <button
            className="text-xs text-blue-700 underline"
            onClick={() => onViewReferenceCode(question)}
          >Ver código de referência</button>
          <button
            className="text-xs text-blue-700 underline"
            onClick={() => onViewTestCases(question)}
          >Ver casos de teste</button>
        </div>
      </div>

      {}
      <div className="bg-white/70 p-6 rounded shadow border border-slate-200">
        <div className="flex gap-2 mb-2">
          <button
            className={`px-3 py-1 rounded ${selectedLanguage === 'python' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => handleLanguageChange('python')}
          >Python</button>
          <button
            className={`px-3 py-1 rounded ${selectedLanguage === 'java' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}
            onClick={() => handleLanguageChange('java')}
          >Java</button>
        </div>
        <textarea
          className="w-full h-48 p-2 border rounded font-mono text-sm"
          value={code}
          onChange={e => setCode(e.target.value)}
          spellCheck={false}
        />
        <div className="flex gap-2 mt-4">
          <button
            className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-60"
            onClick={handleSubmitCode}
            disabled={submitting}
          >{submitting ? 'Enviando...' : 'Enviar Solução'}</button>
          {submissionResult && (
            <span className={`ml-2 px-3 py-1 rounded text-xs font-medium ${
              submissionResult.status === 'accepted' ? 'bg-green-100 text-green-700' :
              submissionResult.status === 'error' ? 'bg-red-100 text-red-700' :
              submissionResult.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
              submissionResult.status === 'timeout' ? 'bg-orange-100 text-orange-700' :
              'bg-slate-100 text-slate-700'
            }`}>
              {submissionResult.message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

