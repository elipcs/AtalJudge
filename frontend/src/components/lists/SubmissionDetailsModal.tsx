import React from 'react';
import { formatLanguageName } from '@/utils/languageUtils';

interface LocalSubmission {
  id: string;
  questionId: string;
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  attempt: number;
  submittedAt: string;
  question?: {
    id: string;
    name?: string;
    title?: string;
  };
  student?: {
    name: string;
  };
  language?: string;
  code?: string;
  verdict?: string;
}

interface SubmissionDetailsModalProps {
  isOpen: boolean;
  submission: LocalSubmission;
  onClose: () => void;
}

export default function SubmissionDetailsModal({
  isOpen,
  submission,
  onClose
}: SubmissionDetailsModalProps) {
  if (!isOpen || !submission) return null;

  const questionTitle = submission.question?.name || submission.question?.title || 'Questão desconhecida';
  
  const getHeaderGradient = () => {
    switch (submission.status) {
      case 'accepted':
        return 'bg-gradient-to-r from-green-50 to-emerald-50';
      case 'error':
        return 'bg-gradient-to-r from-red-50 to-orange-50';
      case 'timeout':
        return 'bg-gradient-to-r from-orange-50 to-amber-50';
      default:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50';
    }
  };

  const getHeaderIconBg = () => {
    switch (submission.status) {
      case 'accepted':
        return 'bg-gradient-to-br from-green-500 to-emerald-600';
      case 'error':
        return 'bg-gradient-to-br from-red-500 to-orange-600';
      case 'timeout':
        return 'bg-gradient-to-br from-orange-500 to-amber-600';
      default:
        return 'bg-gradient-to-br from-yellow-500 to-amber-600';
    }
  };

  const getStatusIcon = () => {
    switch (submission.status) {
      case 'accepted':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'timeout':
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };
  
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={`flex items-center justify-between p-6 border-b border-slate-200 ${getHeaderGradient()} rounded-t-2xl`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 ${getHeaderIconBg()} rounded-xl shadow-lg`}>
              {getStatusIcon()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Detalhes da Submissão</h2>
              <p className="text-sm text-slate-600 mt-0.5">Informações completas da submissão</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 animate-in slide-in-from-top-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {submission.student && (
                  <div>
                    <p className="text-xs font-semibold text-slate-600 mb-1">Aluno:</p>
                    <p className="text-sm text-slate-900 font-medium">{submission.student.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-600 mb-1">Questão:</p>
                  <p className="text-sm text-slate-900 font-medium">{questionTitle}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Status:</p>
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    submission.status === 'accepted' ? 'bg-green-100 text-green-700 border border-green-200' :
                    submission.status === 'error' ? 'bg-red-100 text-red-700 border border-red-200' :
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    submission.status === 'timeout' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {submission.status || submission.verdict || '-'}
                  </span>
                </div>
                
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Nota:</p>
                  <p className="text-lg text-slate-900 font-bold">{submission.score}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Tentativa:</p>
                  <p className="text-sm text-slate-900 font-semibold">{submission.attempt}</p>
                </div>
                
                {submission.language && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                    <p className="text-xs font-semibold text-slate-600 mb-1">Linguagem:</p>
                    <p className="text-sm text-slate-900 font-semibold">{formatLanguageName(submission.language)}</p>
                  </div>
                )}
                
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
                  <p className="text-xs font-semibold text-slate-600 mb-1">Data/Hora:</p>
                  <p className="text-sm text-slate-900 font-semibold">{new Date(submission.submittedAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>
            </div>

            {submission.code && (
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Código Submetido:</h3>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto max-h-64 border border-slate-700">
                  <pre className="text-xs font-mono whitespace-pre-wrap break-words">{submission.code}</pre>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <button 
            onClick={onClose} 
            className="h-12 px-6 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

