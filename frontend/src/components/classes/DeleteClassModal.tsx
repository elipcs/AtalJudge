"use client";

import React from "react";

import { Class } from "../../types";

interface DeleteClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteClass: (id: string) => Promise<boolean>;
  classData: Class | null;
  loading?: boolean;
  error?: string;
}

export default function DeleteClassModal({
  isOpen,
  onClose,
  onDeleteClass,
  classData,
  loading = false,
  error
}: DeleteClassModalProps) {
  const handleDelete = async () => {
    if (!classData) return;

    const success = await onDeleteClass(classData.id);
    
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen || !classData) return null;

  const hasStudents = (classData.studentCount || 0) > 0;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-red-50 to-orange-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Excluir Turma</h2>
              <p className="text-sm text-slate-600 mt-0.5">
                {hasStudents ? "Ação não permitida" : "Confirmar exclusão"}
              </p>
            </div>
          </div>
          {!loading && (
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

        <div className="p-6">
          <div className="space-y-6">
            {hasStudents ? (
              <div className="text-center">
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-red-900">
                      Não é possível excluir esta turma
                    </h3>
                  </div>
                  <p className="text-sm text-red-800 mb-2">
                    A turma <strong>{classData.name}</strong> possui alunos matriculados e não pode ser excluída.
                  </p>
                  <p className="text-xs text-red-700">
                    Para excluir esta turma, primeiro remova todos os alunos matriculados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    Confirmar exclusão
                  </h3>
                  <p className="text-sm text-slate-700 mb-2">
                    Tem certeza que deseja excluir a turma <strong className="text-slate-900">{classData.name}</strong>?
                  </p>
                  <p className="text-sm text-red-600 font-medium">
                    Esta ação não pode ser desfeita.
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {hasStudents ? "Entendi" : "Cancelar"}
              </button>
              {!hasStudents && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 h-12 px-4 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Excluindo...
                    </span>
                  ) : (
                    "Sim, Excluir"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
