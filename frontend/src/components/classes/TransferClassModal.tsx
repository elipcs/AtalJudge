"use client";

import React, { useState, useEffect } from "react";
import { Class, Professor } from "../../types";
import { classesApi } from "../../services/classes";

interface TransferClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onTransfer: (classId: string, newProfessorId: string) => Promise<boolean>;
    classData: Class | null;
    loading?: boolean;
    error?: string;
}

export default function TransferClassModal({
    isOpen,
    onClose,
    onTransfer,
    classData,
    loading: externalLoading = false,
    error: externalError
}: TransferClassModalProps) {
    const [professors, setProfessors] = useState<Professor[]>([]);
    const [selectedProfessorId, setSelectedProfessorId] = useState("");
    const [localLoading, setLocalLoading] = useState(false);
    const [localError, setLocalError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchProfessors = async () => {
                setLocalLoading(true);
                try {
                    const data = await classesApi.getProfessors();
                    // Filter out the current professor
                    const filtered = data.filter(p => p.id !== classData?.professor?.id);
                    setProfessors(filtered);
                } catch (err) {
                    setLocalError("Erro ao carregar lista de professores");
                } finally {
                    setLocalLoading(false);
                }
            };
            fetchProfessors();
            setSelectedProfessorId("");
            setLocalError("");
            setSuccess(false);
        }
    }, [isOpen, classData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!classData || !selectedProfessorId) return;

        setLocalError("");
        const ok = await onTransfer(classData.id, selectedProfessorId);

        if (ok) {
            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    if (!isOpen) return null;

    const isLoading = localLoading || externalLoading;
    const displayError = localError || externalError;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget && !isLoading) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-orange-50 to-amber-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Transferir Turma</h2>
                            <p className="text-sm text-slate-600 mt-0.5">{classData?.name}</p>
                        </div>
                    </div>
                    {!isLoading && (
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
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {success && (
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <p className="text-sm text-green-800 font-semibold">Turma transferida com sucesso!</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                            <div className="flex gap-3">
                                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div className="text-sm text-amber-800">
                                    <p className="font-semibold mb-1">Atenção!</p>
                                    <p>Ao transferir esta turma, você perderá o acesso de edição a ela. A turma passará a ser de responsabilidade do novo professor selecionado.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="professor" className="block text-sm font-semibold text-slate-700 mb-2">
                                Novo Professor
                            </label>
                            <select
                                id="professor"
                                value={selectedProfessorId}
                                onChange={(e) => setSelectedProfessorId(e.target.value)}
                                required
                                className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                disabled={isLoading || success}
                            >
                                <option value="">Selecione um professor...</option>
                                {professors.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.name} ({p.email})
                                    </option>
                                ))}
                            </select>
                            {professors.length === 0 && !isLoading && !localError && (
                                <p className="mt-2 text-xs text-slate-500 italic">Nenhum outro professor disponível no momento.</p>
                            )}
                        </div>

                        {displayError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start gap-2">
                                    <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-red-800 flex-1">{displayError}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 pt-6 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading || success}
                                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading || !selectedProfessorId || success}
                                className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed ${success
                                        ? "bg-green-500 hover:bg-green-600 focus:ring-green-500 shadow-lg"
                                        : "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 focus:ring-orange-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                                    }`}
                            >
                                {success ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Sucesso!
                                    </span>
                                ) : isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Processando...
                                    </span>
                                ) : (
                                    "Transferir"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
