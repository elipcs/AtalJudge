"use client";

import React, { useState, useEffect } from "react";

import { Class } from "../../types";

interface EditClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditClass: (id: string, data: { name: string }) => Promise<boolean>;
  classData: Class | null;
  loading?: boolean;
  error?: string;
}

export default function EditClassModal({
  isOpen,
  onClose,
  onEditClass,
  classData,
  loading = false,
  error
}: EditClassModalProps) {
  const [name, setName] = useState("");
  const [localError, setLocalError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && classData) {
      const id = setTimeout(() => {
        setName(classData.name || "");
        setLocalError("");
        setSaveSuccess(false);
      }, 0);
      return () => clearTimeout(id);
    }
  }, [isOpen, classData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!classData) return;

    if (!name || !name.trim()) {
      setLocalError("Nome da turma é obrigatório");
      return;
    }

    if (name.trim().length < 3) {
      setLocalError("Nome da turma deve ter pelo menos 3 caracteres");
      return;
    }

    if (name.trim().length > 50) {
      setLocalError("Nome da turma deve ter no máximo 50 caracteres");
      return;
    }

    setLocalError("");

    const trimmedName = name.trim();
    
    const success = await onEditClass(classData.id, { name: trimmedName });
    
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setName("");
      setLocalError("");
      setSaveSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          handleClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Editar Turma</h2>
              <p className="text-sm text-slate-600 mt-0.5">Atualize as informações da turma</p>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {saveSuccess && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-800 font-semibold">Turma atualizada com sucesso!</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Nome da Turma *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                placeholder="Ex: Algoritmos 2024.1"
                required
                className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                disabled={loading}
                maxLength={50}
              />
              <div className="mt-1.5 text-right text-xs text-slate-500">
                {name.length}/50 caracteres
              </div>
            </div>

            {(localError || error) && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 flex-1">{localError || error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading || saveSuccess}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim() || saveSuccess}
                className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed ${
                  saveSuccess
                    ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                }`}
              >
                {saveSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Atualizada com sucesso!
                  </span>
                ) : loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvando...
                  </span>
                ) : (
                  "Salvar Alterações"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
