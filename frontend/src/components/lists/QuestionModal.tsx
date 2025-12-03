import React from 'react';

import { Question } from '../../types';
import TextEditorWithLatex from '../questions/TextEditorWithLatex';
import TagInput from '../ui/TagInput';
import { secondsToMs, mbToKb } from '@/utils/timeMemoryConverter';

interface QuestionFormData {
  title: string;
  text: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
  timeLimit: string;
  memoryLimit: string;
  source?: string;
  tags?: string[];
}

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: QuestionFormData) => void;
  question?: Question;
  title: string;
}

export default function QuestionModal({
  isOpen,
  onClose,
  onSave,
  question,
  title
}: QuestionModalProps) {
  const [showPreviewMode, setShowPreviewMode] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const [formData, setFormData] = React.useState({
    title: question?.title || '',
    text: question?.text || '',
    timeLimit: question?.timeLimit || '1s',
    memoryLimit: question?.memoryLimit || '128MB',
    examples: question?.examples || [{ input: '', output: '' }],
    source: question?.source || '',
    tags: question?.tags || [],
  });

  React.useEffect(() => {
    if (question) {
      // Converter timeLimitMs (backend) para timeLimit em segundos (frontend)
      let timeLimit = '1s';
      if (question.timeLimit) {
        // Se timeLimit já é string (formato frontend), use diretamente
        if (typeof question.timeLimit === 'string') {
          timeLimit = question.timeLimit.endsWith('s') ? question.timeLimit : `${question.timeLimit}s`;
        }
      }

      // Converter memoryLimitKb (backend) para memoryLimit em MB (frontend)
      let memoryLimit = '128MB';
      if (question.memoryLimit) {
        // Se memoryLimit já é string (formato frontend), use diretamente
        if (typeof question.memoryLimit === 'string') {
          const upper = question.memoryLimit.toUpperCase();
          memoryLimit = upper.endsWith('MB') ? upper : `${question.memoryLimit}MB`;
        }
      }

      setFormData({
        title: question.title || '',
        text: question.text || '',
        timeLimit,
        memoryLimit,
        examples: question.examples || [{ input: '', output: '' }],
        source: question.source || '',
        tags: question.tags || [],
      });
    } else {
      setFormData({
        title: '',
        text: '',
        timeLimit: '1s',
        memoryLimit: '128MB',
        examples: [{ input: '', output: '' }],
        source: '',
        tags: [],
      });
    }
  }, [question, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleTimeLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove sufixo 's' se houver
    const withoutSuffix = value.replace(/s$/i, '');
    // Mantém apenas números, ponto e vírgula
    const sanitized = withoutSuffix.replace(/[^0-9.,]/g, '');
    // Converte vírgula para ponto
    const normalized = sanitized.replace(',', '.');
    setFormData({ ...formData, timeLimit: normalized ? `${normalized}s` : '' });
  };

  const handleMemoryLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Remove sufixo 'MB' se houver
    const withoutSuffix = value.replace(/mb$/i, '');
    // Mantém apenas números, ponto e vírgula
    const sanitized = withoutSuffix.replace(/[^0-9.,]/g, '');
    // Converte vírgula para ponto
    const normalized = sanitized.replace(',', '.');
    setFormData({ ...formData, memoryLimit: normalized ? `${normalized}MB` : '' });
  };

  const handleExampleChange = (index: number, field: 'input' | 'output', value: string) => {
    const newExamples = [...formData.examples];
    newExamples[index][field] = value;
    setFormData({ ...formData, examples: newExamples });
  };

  const addExample = () => {
    setFormData({
      ...formData,
      examples: [...formData.examples, { input: '', output: '' }]
    });
  };

  const removeExample = (index: number) => {
    if (formData.examples.length > 1) {
      const newExamples = formData.examples.filter((_, i) => i !== index);
      setFormData({ ...formData, examples: newExamples });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      onSave({
        ...formData,
        examples: formData.examples.filter(ex => ex.input.trim() || ex.output.trim()),
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
              <p className="text-sm text-slate-600 mt-0.5">Configure os detalhes da questão</p>
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
          <div className="bg-white rounded-xl border border-slate-200 p-2 mb-6">
            <nav className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowPreviewMode(false)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${!showPreviewMode
                  ? 'shadow-sm border bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Editor
              </button>
              <button
                type="button"
                onClick={() => setShowPreviewMode(true)}
                className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${showPreviewMode
                  ? 'shadow-sm border bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
              >
                Preview
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Título *</label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                required
                disabled={isSaving}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Limite de Tempo (segundos)</label>
                <input
                  name="timeLimit"
                  value={formData.timeLimit}
                  onChange={handleTimeLimitChange}
                  onBlur={(e) => {
                    const value = e.target.value.replace(/s$/i, '').replace(/[^0-9.,]/g, '').replace(',', '.');
                    if (value) {
                      setFormData({ ...formData, timeLimit: `${value}s` });
                    } else if (!e.target.value) {
                      setFormData({ ...formData, timeLimit: '1s' });
                    }
                  }}
                  className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Ex: 1.5"
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Limite de Memória (MB)</label>
                <input
                  name="memoryLimit"
                  value={formData.memoryLimit}
                  onChange={handleMemoryLimitChange}
                  onBlur={(e) => {
                    const value = e.target.value.replace(/mb$/i, '').replace(/[^0-9.,]/g, '').replace(',', '.');
                    if (value) {
                      setFormData({ ...formData, memoryLimit: `${value}MB` });
                    } else if (!e.target.value) {
                      setFormData({ ...formData, memoryLimit: '128MB' });
                    }
                  }}
                  className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Ex: 128"
                  disabled={isSaving}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Fonte (opcional)</label>
                <input
                  name="source"
                  value={formData.source || ''}
                  onChange={handleChange}
                  className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  placeholder="Ex: Codeforces, AtCoder, etc."
                  disabled={isSaving}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Tags (opcional)</label>
                <TagInput
                  tags={formData.tags || []}
                  onChange={(tags) => setFormData({ ...formData, tags })}
                  placeholder="Adicionar tags..."
                />
              </div>
            </div>

            <div>
              <label className="block text-lg font-semibold text-slate-700 mb-2">Texto da Questão</label>
              <TextEditorWithLatex
                value={formData.text}
                onChange={(value: string) => setFormData({ ...formData, text: value })}
                placeholder=""
                className="h-64"
                showPreview={showPreviewMode}
              />
            </div>

            <div className="border-t border-slate-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-semibold text-slate-700">Exemplos</label>
                <button
                  type="button"
                  onClick={addExample}
                  disabled={isSaving}
                  className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Adicionar Exemplo
                </button>
              </div>

              <div className="space-y-4">
                {formData.examples.map((example, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-200 hover:border-slate-300 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-700">Exemplo {index + 1}</span>
                      {formData.examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeExample(index)}
                          disabled={isSaving}
                          className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Remover
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">Entrada</label>
                        <textarea
                          value={example.input}
                          onChange={(e) => handleExampleChange(index, 'input', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 h-24 text-sm font-mono resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          placeholder="Digite a entrada do exemplo..."
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-2">Saída</label>
                        <textarea
                          value={example.output}
                          onChange={(e) => handleExampleChange(index, 'output', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 h-24 text-sm font-mono resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                          placeholder="Digite a saída esperada..."
                          disabled={isSaving}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 h-12 px-4 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSaving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvando...
                  </span>
                ) : (
                  'Salvar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
