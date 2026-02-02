"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/types";
import * as api from "@/config/api";
import CodeSubmission from "@/components/questions/CodeSubmission";
import dynamic from "next/dynamic";
import { formatTimeLimit, formatMemoryLimit } from "@/utils/timeMemoryConverter";

const MarkdownRenderer = dynamic(() => import("@/components/MarkdownRenderer"), { ssr: false });

export default function QuestionDetailPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const questionId = searchParams.get('id') || '';

    const [question, setQuestion] = useState<Question | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadQuestion();
    }, [questionId]);

    const loadQuestion = async () => {
        if (!questionId) return;

        setLoading(true);
        try {
            const response = await api.get(`/questions/${questionId}`);
            const data = response.data as any;

            // Mapear dados do backend para o formato frontend
            const questionData: Question = {
                ...data,
                // Converter timeLimitMs para timeLimit em string
                timeLimit: data.timeLimitMs ? `${data.timeLimitMs / 1000}s` : '1s',
                // Converter memoryLimitKb para memoryLimit em string  
                memoryLimit: data.memoryLimitKb ? `${Math.round(data.memoryLimitKb / 1024)}MB` : '64MB',
            };

            setQuestion(questionData);
        } catch (error: any) {
            toast({
                title: "Erro",
                description: error.response?.data?.message || "Erro ao carregar questão",
                variant: "destructive",
            });
            router.push("/questoes");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <PageLoading message="Carregando questão..." />;
    }

    if (!question) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
                <div className="max-w-4xl mx-auto">
                    <Link href="/questoes">
                        <Button
                            variant="outline"
                            className="mb-6 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                        >
                            ← Voltar
                        </Button>
                    </Link>
                    <Card className="p-12 text-center border-slate-200 rounded-3xl shadow-lg">
                        <div className="text-slate-400 mb-4">
                            <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Questão não encontrada</h2>
                        <p className="text-slate-600">A questão que você está procurando não existe ou foi removida.</p>
                    </Card>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/questoes">
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                        >
                            ← Voltar
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {question.title}
                        </h1>
                    </div>
                </div>
                <Link href={`/questoes/editar?id=${questionId}`}>
                    <Button
                        variant="outline"
                        className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Editar Questão
                    </Button>
                </Link>
            </div>

            {/* Main Content - 2 Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Question Details */}
                <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
                    <div className="mb-6">
                        {/* Tags e Fonte */}
                        <div className="flex flex-wrap gap-2 items-center mb-4">
                            {question.source && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 text-slate-700 text-xs font-semibold rounded-full border border-slate-200 shadow-sm">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    {question.source}
                                </div>
                            )}
                            {question.tags && question.tags.map((tag) => (
                                <span key={tag} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 shadow-sm hover:border-blue-300 transition-all">
                                    #{tag}
                                </span>
                            ))}
                        </div>

                        {/* Limites de Tempo e Memória */}
                        <div className="grid grid-cols-1 gap-3">
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Limite de Tempo</p>
                                    <p className="text-sm font-bold text-slate-900">{formatTimeLimit(question.timeLimit)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Limite de Memória</p>
                                    <p className="text-sm font-bold text-slate-900">{formatMemoryLimit(question.memoryLimit)}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Descrição */}
                    {question.text && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Enunciado</h3>
                            <div className="bg-slate-50 rounded-xl p-4">
                                <MarkdownRenderer content={question.text} />
                            </div>
                        </div>
                    )}

                    {/* Exemplos */}
                    {question.examples && question.examples.length > 0 && (
                        <div>
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">Exemplos</h3>
                            <div className="space-y-4">
                                {question.examples.map((example, idx) => (
                                    <div key={idx} className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-sm font-semibold text-slate-600 mb-3">Exemplo {idx + 1}:</p>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600 mb-2">Entrada:</p>
                                                <pre className="bg-white rounded-lg p-3 text-sm text-slate-800 font-mono border border-slate-200 overflow-x-auto">
                                                    {example.input}
                                                </pre>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-slate-600 mb-2">Saída:</p>
                                                <pre className="bg-white rounded-lg p-3 text-sm text-slate-800 font-mono border border-slate-200 overflow-x-auto">
                                                    {example.output}
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>

                {/* Right Column - Code Submission */}
                <CodeSubmission
                    questionId={questionId}
                    questionListId=""
                    userRole="professor"
                    questionName={question.title}
                    onSubmit={(code, language) => {
                    }}
                />
            </div>
        </div>
    );
}
