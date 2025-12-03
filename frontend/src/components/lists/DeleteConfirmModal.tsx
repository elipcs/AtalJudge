import React from 'react';
import { Button } from "@/components/ui/button";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  questionTitle: string;
}

export default function DeleteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  questionTitle
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-2xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-red-100 rounded-xl">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Excluir Questão</h2>
        </div>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Confirmar exclusão</h3>
            <p className="text-slate-600">
              Tem certeza que deseja excluir a questão <strong>{questionTitle}</strong>?
            </p>
            <p className="text-sm text-red-600 font-medium mt-2">
              Esta ação não pode ser desfeita.
            </p>
          </div>
          <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200 order-1"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              className="flex-1 h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed order-2"
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

