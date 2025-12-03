import React from 'react';

import { Question } from '../../types';

interface ReferenceCodeModalProps {
  isOpen: boolean;
  question: Question;
  onClose: () => void;
}

export default function ReferenceCodeModal({
  isOpen,
  question,
  onClose
}: ReferenceCodeModalProps) {
  if (!isOpen || !question) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto p-6">
        <h2 className="text-xl font-bold mb-4">Código de Referência</h2>
        <div className="mb-2">
          <span className="font-medium">Linguagem: </span>{question.referenceLanguage || 'N/A'}
        </div>
        <pre className="bg-slate-100 rounded p-4 text-sm overflow-x-auto mb-4">
          {question.referenceCode || 'Nenhum código de referência disponível.'}
        </pre>
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded bg-blue-600 text-white font-medium hover:bg-blue-700">Fechar</button>
        </div>
      </div>
    </div>
  );
};

