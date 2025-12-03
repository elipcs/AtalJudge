"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dropdown } from "@/components/ui/dropdown";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/types";
import * as api from "@/config/api";
import PageHeader from "@/components/PageHeader";
import QuestionModal from "@/components/lists/QuestionModal";
import TestCasesModal from "@/components/questions/TestCasesModal";
import ImportQuestionsModal from "@/components/questions/ImportQuestionsModal";
import { formatTimeLimit, formatMemoryLimit } from "@/utils/timeMemoryConverter";

interface QuestionsPageState {
    questions: Question[];
    loading: boolean;
    debouncedSearchTerm: string;
    sourceFilter: string;
    tagFilter: string[];
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    totalItems: number;
}

export default function QuestoesPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [state, setState] = useState<QuestionsPageState>({
        questions: [],
        loading: true,
        debouncedSearchTerm: "",
        sourceFilter: "all",
        tagFilter: [],
        currentPage: 1,
        itemsPerPage: 20,
        totalPages: 1,
        totalItems: 0,
    });

    // Estado para o termo de busca imediato (sem debounce)
    const [searchTerm, setSearchTerm] = useState("");
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    // Estados para modais
    const [showQuestionModal, setShowQuestionModal] = useState(false);
    const [showTestCasesModal, setShowTestCasesModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | undefined>(undefined);

    const loadQuestions = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));
        try {
            // Se há termo de busca, buscar globalmente
            if (state.debouncedSearchTerm.trim()) {
                const searchParams = new URLSearchParams();
                searchParams.append('q', state.debouncedSearchTerm);
                searchParams.append('page', state.currentPage.toString());
                searchParams.append('limit', state.itemsPerPage.toString());

                const response = await api.get<any>(`/questions/search/global?${searchParams.toString()}`);
                const { questions = [], total = 0 } = response.data || {};

                // Mapear dados do backend para o formato frontend
                const mappedQuestions = (questions || []).map((q: any) => ({
                    ...q,
                    // Converter timeLimitMs para timeLimit em string
                    timeLimit: q.timeLimitMs ? `${q.timeLimitMs / 1000}s` : '1s',
                    // Converter memoryLimitKb para memoryLimit em string  
                    memoryLimit: q.memoryLimitKb ? `${Math.round(q.memoryLimitKb / 1024)}MB` : '64MB',
                }));

                setState(prev => ({
                    ...prev,
                    questions: mappedQuestions,
                    loading: false,
                    totalItems: total || 0,
                    totalPages: Math.ceil((total || 0) / state.itemsPerPage),
                }));
            } else {
                // Caso contrário, buscar minhas questões
                const searchParams = new URLSearchParams();
                searchParams.append('page', state.currentPage.toString());
                searchParams.append('limit', state.itemsPerPage.toString());

                if (state.sourceFilter !== "all") searchParams.append('source', state.sourceFilter);
                if (state.tagFilter.length > 0) searchParams.append('tags', state.tagFilter.join(','));

                const response = await api.get<any>(`/questions?${searchParams.toString()}`);

                const { questions = [], pagination = {} } = response.data || {};

                // Mapear dados do backend para o formato frontend
                const mappedQuestions = (questions || []).map((q: any) => ({
                    ...q,
                    // Converter timeLimitMs para timeLimit em string
                    timeLimit: q.timeLimitMs ? `${q.timeLimitMs / 1000}s` : '1s',
                    // Converter memoryLimitKb para memoryLimit em string  
                    memoryLimit: q.memoryLimitKb ? `${Math.round(q.memoryLimitKb / 1024)}MB` : '64MB',
                }));

                setState(prev => ({
                    ...prev,
                    questions: mappedQuestions,
                    loading: false,
                    totalPages: pagination.totalPages || 1,
                    totalItems: pagination.total || 0,
                }));
            }

        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao carregar questões",
                variant: "destructive",
            });
            setState(prev => ({ ...prev, loading: false }));
        }
    }, [state.currentPage, state.itemsPerPage, state.sourceFilter, state.tagFilter, state.debouncedSearchTerm]);

    // Efeito para carregar questões quando mudam critérios de busca
    useEffect(() => {
        loadQuestions();
    }, [loadQuestions]);

    // Efeito para fazer debounce na busca
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        debounceTimer.current = setTimeout(() => {
            setState(prev => ({
                ...prev,
                debouncedSearchTerm: searchTerm,
                currentPage: 1
            }));
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchTerm]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handlePageChange = (page: number) => {
        setState(prev => ({ ...prev, currentPage: page }));
    };

    // Usar as questões diretamente (já filtradas pelo backend)
    const displayedQuestions = state.questions;

    const getTagColor = (index: number) => {
        const colors = [
            "bg-blue-100 text-blue-700 border-blue-200",
            "bg-green-100 text-green-700 border-green-200",
            "bg-purple-100 text-purple-700 border-purple-200",
            "bg-orange-100 text-orange-700 border-orange-200",
            "bg-pink-100 text-pink-700 border-pink-200",
            "bg-indigo-100 text-indigo-700 border-indigo-200",
        ];
        return colors[index % colors.length];
    };

    if (state.loading) {
        return <PageLoading message="Carregando questões..." />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
            <div className="max-w-7xl mx-auto">
                <PageHeader
                    title="Minhas Questões"
                    description="Gerencie suas questões e casos de teste"
                    icon={
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    }
                    iconColor="blue"
                >
                    <Button
                        onClick={() => {
                            setSelectedQuestion(undefined);
                            setShowQuestionModal(true);
                        }}
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Nova Questão
                    </Button>
                    <Button
                        onClick={() => setShowImportModal(true)}
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Importar Questões
                    </Button>
                </PageHeader>

                <Card className="p-6 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <Input
                                placeholder="Buscar por título, fonte ou tags..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="flex gap-2">


                            <Dropdown
                                value={state.itemsPerPage.toString()}
                                onChange={(value) => setState(prev => ({ ...prev, itemsPerPage: Number(value), currentPage: 1 }))}
                                options={[
                                    { value: "10", label: "10 por página" },
                                    { value: "20", label: "20 por página" },
                                    { value: "50", label: "50 por página" },
                                    { value: "100", label: "100 por página" }
                                ]}
                                placeholder="Itens por página"
                            />

                            <Button
                                onClick={loadQuestions}
                                variant="outline"
                                className="px-4 py-2 text-sm"
                            >
                                Atualizar
                            </Button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                Questões ({state.totalItems})
                            </h2>
                        </div>

                        {displayedQuestions.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-gray-400 mb-4">
                                    <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-600">Nenhuma questão encontrada</h3>
                                <p className="text-gray-500">
                                    {state.debouncedSearchTerm || state.sourceFilter !== "all"
                                        ? "Tente ajustar os filtros de busca."
                                        : "Crie sua primeira questão para começar!"}
                                </p>
                                {state.questions.length === 0 && state.sourceFilter === "all" && (
                                    <Button
                                        onClick={() => {
                                            setSelectedQuestion(undefined);
                                            setShowQuestionModal(true);
                                        }}
                                        className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
                                    >
                                        Criar Primeira Questão
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Título</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Fonte</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Tags</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Limites</th>
                                                <th className="text-center py-3 px-4 font-medium text-gray-600 w-[1%] whitespace-nowrap">Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayedQuestions.map((question) => (
                                                <tr
                                                    key={question.id}
                                                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                                                >
                                                    <td className="py-3 px-4">
                                                        <div
                                                            className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                                                            onClick={() => router.push(`/questoes/${question.id}`)}
                                                        >
                                                            {question.title}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        {question.source && (
                                                            <span className="px-2 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                                </svg>
                                                                {question.source}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="flex flex-wrap gap-1">
                                                            {question.tags && question.tags.slice(0, 3).map((tag, index) => (
                                                                <span key={tag} className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getTagColor(index)}`}>
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                            {question.tags && question.tags.length > 3 && (
                                                                <span className="text-xs text-gray-500">+{question.tags.length - 3}</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <div className="text-xs text-gray-600 space-y-1">
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                                {formatTimeLimit(question.timeLimit)}
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                                                </svg>
                                                                {formatMemoryLimit(question.memoryLimit)}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center whitespace-nowrap">
                                                        <div className="flex justify-center gap-2">
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedQuestion(question);
                                                                    setShowQuestionModal(true);
                                                                }}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl flex items-center gap-2"
                                                                title="Editar"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                                Editar
                                                            </Button>
                                                            <Button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedQuestion(question);
                                                                    setShowTestCasesModal(true);
                                                                }}
                                                                variant="outline"
                                                                size="sm"
                                                                className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl flex items-center gap-2"
                                                                title="Casos de Teste"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                </svg>
                                                                Casos de Teste
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                    <div className="text-sm text-gray-600">
                                        {state.debouncedSearchTerm.trim() ? (
                                            <>
                                                Mostrando {displayedQuestions.length} resultado(s) filtrado(s) de {state.totalItems} questões
                                            </>
                                        ) : (
                                            <>
                                                Mostrando {((state.currentPage - 1) * state.itemsPerPage) + 1} a {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} de {state.totalItems} questões
                                            </>
                                        )}
                                        {state.totalPages > 1 && (
                                            <> · Página {state.currentPage} de {state.totalPages}</>
                                        )}
                                    </div>
                                    {state.totalPages > 1 && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(1)}
                                                disabled={state.currentPage === 1}
                                                className="px-3"
                                            >
                                                ««
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(state.currentPage - 1)}
                                                disabled={state.currentPage === 1}
                                            >
                                                Anterior
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(state.currentPage + 1)}
                                                disabled={state.currentPage === state.totalPages}
                                            >
                                                Próxima
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePageChange(state.totalPages)}
                                                disabled={state.currentPage === state.totalPages}
                                                className="px-3"
                                            >
                                                »»
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </Card>

                {/* Modal para criar/editar questão */}
                <QuestionModal
                    isOpen={showQuestionModal}
                    onClose={() => {
                        setShowQuestionModal(false);
                        setSelectedQuestion(undefined);
                    }}
                    onSave={async (questionData) => {
                        try {
                            // Converter timeLimit e memoryLimit para o formato esperado pelo backend
                            const timeLimitMs = questionData.timeLimit
                                ? Math.round(parseFloat(questionData.timeLimit.toString().replace(/s$/i, '')) * 1000)
                                : 1000;

                            const memoryLimitKb = questionData.memoryLimit
                                ? Math.round(parseFloat(questionData.memoryLimit.toString().replace(/mb$/i, '')) * 1024)
                                : 64000;

                            // Mapear exemplos para o formato esperado pelo backend
                            const examples = questionData.examples.map(ex => ({
                                input: ex.input,
                                output: ex.output,
                            }));

                            const apiData = {
                                title: questionData.title,
                                text: questionData.text,
                                timeLimitMs,
                                memoryLimitKb,
                                examples,
                                source: questionData.source ? questionData.source.trim() : null,
                                tags: questionData.tags && questionData.tags.length > 0 ? questionData.tags.filter((t: string) => t.trim()) : null,
                            };

                            if (selectedQuestion) {
                                // Editar questão existente
                                await api.put(`/questions/${selectedQuestion.id}`, apiData);
                                toast({
                                    title: "Sucesso",
                                    description: "Questão atualizada com sucesso!",
                                });
                            } else {
                                // Criar nova questão
                                await api.post("/questions", apiData);
                                toast({
                                    title: "Sucesso",
                                    description: "Questão criada com sucesso!",
                                });
                            }
                            setShowQuestionModal(false);
                            setSelectedQuestion(undefined);
                            loadQuestions();
                        } catch (error: any) {
                            toast({
                                title: "Erro",
                                description: error.response?.data?.message || "Erro ao processar questão",
                                variant: "destructive",
                            });
                        }
                    }}
                    question={selectedQuestion}
                    title={selectedQuestion ? "Editar Questão" : "Criar Questão"}
                />

                {/* Modal para casos de teste */}
                {showTestCasesModal && selectedQuestion && (
                    <TestCasesModal
                        isOpen={showTestCasesModal}
                        onClose={() => {
                            setShowTestCasesModal(false);
                            setSelectedQuestion(undefined);
                        }}
                        questionId={selectedQuestion.id}
                        onSave={() => {
                            setShowTestCasesModal(false);
                            setSelectedQuestion(undefined);
                            loadQuestions();
                        }}
                    />
                )}

                {/* Modal para importar questões */}
                <ImportQuestionsModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onSuccess={() => loadQuestions()}
                />
            </div>
        </div>
    );
}
