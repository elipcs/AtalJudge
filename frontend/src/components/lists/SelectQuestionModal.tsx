"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Question } from "@/types";
import * as api from "@/config/api";
import { useToast } from "@/hooks/use-toast";
import { formatTimeLimit, formatMemoryLimit } from "@/utils/timeMemoryConverter";

interface SelectQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (questionIds: string[]) => void;
    existingQuestionIds: string[];
}

type SortOption = "title" | "recent" | "source";

const ITEMS_PER_PAGE = 10;

export default function SelectQuestionModal({
    isOpen,
    onClose,
    onSelect,
    existingQuestionIds,
}: SelectQuestionModalProps) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [sourceFilter, setSourceFilter] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<SortOption>("recent");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedQuestions, setSelectedQuestions] = useState<string[]>([]);
    const { toast } = useToast();

    useEffect(() => {
        if (isOpen) {
            loadQuestions();
            setCurrentPage(1);
            setSelectedQuestions([]);
        }
    }, [isOpen]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sourceFilter, selectedTags, sortBy]);

    const loadQuestions = async () => {
        try {
            setLoading(true);
            const response = await api.get<any>("/questions");
            setQuestions(response.data?.questions || []);
        } catch (error: any) {
            toast({
                title: "Erro",
                description: "Erro ao carregar questões",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    // Obter lista de todas as fontes e tags únicas
    const allSources = Array.from(new Set(questions.map(q => q.source).filter(Boolean))) as string[];
    const allTags = Array.from(new Set(questions.flatMap(q => q.tags || [])));

    // Filtrar questões
    let filteredQuestions = questions.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (q.source?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesSource = !sourceFilter || q.source === sourceFilter;

        const matchesTags = selectedTags.length === 0 ||
            selectedTags.some(tag => q.tags?.includes(tag));

        return matchesSearch && matchesSource && matchesTags;
    });

    // Ordenar questões
    filteredQuestions = [...filteredQuestions].sort((a, b) => {
        switch (sortBy) {
            case "title":
                return a.title.localeCompare(b.title);
            case "source":
                return (a.source || "").localeCompare(b.source || "");
            case "recent":
            default:
                return 0; // Mantém ordem original (mais recente)
        }
    });

    const getTagColor = (index: number) => {
        const colors = [
            "bg-blue-100 text-blue-700 border-blue-200",
            "bg-green-100 text-green-700 border-green-200",
            "bg-purple-100 text-purple-700 border-purple-200",
            "bg-orange-100 text-orange-700 border-orange-200",
            "bg-pink-100 text-pink-700 border-pink-200",
        ];
        return colors[index % colors.length];
    };

    const toggleTagFilter = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // Paginação
    const totalPages = Math.ceil(filteredQuestions.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const handlePreviousPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages));
    };

    const toggleQuestionSelection = (questionId: string) => {
        setSelectedQuestions(prev =>
            prev.includes(questionId)
                ? prev.filter(id => id !== questionId)
                : [...prev, questionId]
        );
    };

    const handleSaveSelection = () => {
        if (selectedQuestions.length === 0) {
            toast({
                title: "Atenção",
                description: "Selecione pelo menos uma questão",
                variant: "destructive",
            });
            return;
        }
        onSelect(selectedQuestions);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-200"
            onClick={(e) => {
                if (e.target === e.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-4 my-8 animate-in zoom-in-95 duration-200 overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Selecionar Questões</h2>
                            <p className="text-sm text-slate-600 mt-0.5">
                                Adicione questões à lista {selectedQuestions.length > 0 && `(${selectedQuestions.length} selecionada${selectedQuestions.length > 1 ? 's' : ''})`}
                            </p>
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

                <div className="p-6">
                    {/* Barra de Busca */}
                    <div className="space-y-3 pb-3 border-b border-slate-200">
                        <Input
                            placeholder="Buscar por título ou fonte..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="rounded-xl"
                        />

                        {/* Filtros */}
                        <div className="space-y-3">
                            {/* Filtro por Fonte */}
                            {allSources.length > 0 && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                                        Filtrar por Fonte
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => setSourceFilter("")}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!sourceFilter
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                        >
                                            Todas
                                        </button>
                                        {allSources.map(source => (
                                            <button
                                                key={source}
                                                onClick={() => setSourceFilter(sourceFilter === source ? "" : source)}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sourceFilter === source
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                    }`}
                                            >
                                                {source}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Filtro por Tags */}
                            {allTags.length > 0 && (
                                <div>
                                    <label className="text-xs font-semibold text-slate-600 mb-2 block">
                                        Filtrar por Tags {selectedTags.length > 0 && `(${selectedTags.length})`}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {allTags.map((tag, index) => (
                                            <button
                                                key={tag}
                                                onClick={() => toggleTagFilter(tag)}
                                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${selectedTags.includes(tag)
                                                        ? `${getTagColor(index).replace('border', 'border-2')} bg-opacity-100`
                                                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                                                    }`}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Ordenação */}
                            <div>
                                <label className="text-xs font-semibold text-slate-600 mb-2 block">
                                    Ordenar por
                                </label>
                                <div className="flex gap-2">
                                    {(["recent", "title", "source"] as SortOption[]).map(option => (
                                        <button
                                            key={option}
                                            onClick={() => setSortBy(option)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sortBy === option
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                                }`}
                                        >
                                            {option === "recent" && "Recentes"}
                                            {option === "title" && "Título"}
                                            {option === "source" && "Fonte"}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lista de Questões */}
                    <div className="min-h-96 space-y-3 py-3 mb-4">
                        {loading ? (
                            <div className="text-center py-12 text-slate-600">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                <p>Carregando questões...</p>
                            </div>
                        ) : filteredQuestions.length === 0 ? (
                            <div className="text-center py-12 text-slate-600">
                                <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {questions.length === 0
                                    ? "Você ainda não criou nenhuma questão. Crie uma questão primeiro em /questoes"
                                    : "Nenhuma questão encontrada com os filtros selecionados"}
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="text-sm text-slate-600 font-medium">
                                    {filteredQuestions.length} {filteredQuestions.length === 1 ? "questão encontrada" : "questões encontradas"}
                                    {totalPages > 1 && ` (Página ${currentPage} de ${totalPages})`}
                                </div>
                                {paginatedQuestions.map((question) => {
                                    const isAlreadyAdded = existingQuestionIds.includes(question.id);
                                    const isSelected = selectedQuestions.includes(question.id);

                                    return (
                                        <div
                                            key={question.id}
                                            onClick={() => !isAlreadyAdded && toggleQuestionSelection(question.id)}
                                            className={`border-2 rounded-xl p-4 transition-all duration-200 ${isAlreadyAdded
                                                    ? "bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed"
                                                    : isSelected
                                                        ? "bg-blue-50 border-blue-500 shadow-md cursor-pointer"
                                                        : "bg-white border-slate-200 hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 cursor-pointer"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="font-bold text-slate-900 truncate">{question.title}</h3>
                                                        {isAlreadyAdded && (
                                                            <span className="flex-shrink-0 inline-flex items-center justify-center w-5 h-5 rounded-full bg-green-100 border border-green-300">
                                                                <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Badges */}
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {question.source && (
                                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 hover:bg-slate-200 transition-colors">
                                                                {question.source}
                                                            </span>
                                                        )}
                                                        {question.tags?.map((tag, index) => (
                                                            <span
                                                                key={tag}
                                                                className={`px-2.5 py-1 text-xs font-semibold rounded-full border transition-colors ${getTagColor(index)}`}
                                                            >
                                                                {tag}
                                                            </span>
                                                        ))}
                                                    </div>

                                                    {/* Informações */}
                                                    <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                            {formatTimeLimit(question.timeLimit)}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                            </svg>
                                                            {formatMemoryLimit(question.memoryLimit)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Checkbox visual */}
                                                <div className="flex-shrink-0">
                                                    {isAlreadyAdded ? (
                                                        <div className="w-6 h-6 rounded-md bg-green-100 border-2 border-green-500 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    ) : (
                                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isSelected
                                                                ? "bg-blue-600 border-blue-600"
                                                                : "bg-white border-slate-300 hover:border-blue-400"
                                                            }`}>
                                                            {isSelected && (
                                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Paginação */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between pt-4 border-t border-slate-200 mt-4">
                            <div className="text-sm text-slate-600 font-medium">
                                Mostrando {startIndex + 1} a {Math.min(startIndex + ITEMS_PER_PAGE, filteredQuestions.length)} de {filteredQuestions.length}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    variant="outline"
                                    className="rounded-lg"
                                    size="sm"
                                >
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Anterior
                                </Button>
                                <div className="flex items-center px-3 py-2 text-sm font-semibold text-slate-700">
                                    {currentPage} / {totalPages}
                                </div>
                                <Button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    variant="outline"
                                    className="rounded-lg"
                                    size="sm"
                                >
                                    Próxima
                                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Botões de Ação */}
                    <div className="flex justify-between items-center gap-3 mt-4 pt-4 border-t border-slate-200">
                        <div className="text-sm text-slate-600">
                            {selectedQuestions.length > 0 && (
                                <span className="font-semibold text-blue-600">
                                    {selectedQuestions.length} questão{selectedQuestions.length > 1 ? 'ões' : ''} selecionada{selectedQuestions.length > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <Button onClick={onClose} variant="outline" className="rounded-xl font-semibold">
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveSelection}
                                className="rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg"
                                disabled={selectedQuestions.length === 0}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Adicionar {selectedQuestions.length > 0 && `(${selectedQuestions.length})`}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
