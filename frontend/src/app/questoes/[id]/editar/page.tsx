"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PageLoading from "@/components/PageLoading";
import { useToast } from "@/hooks/use-toast";
import { Question } from "@/types";
import * as api from "@/config/api";
import QuestionModal from "@/components/lists/QuestionModal";
import { secondsToMs, mbToKb } from "@/utils/timeMemoryConverter";

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

export default function EditQuestionPage() {
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const questionId = params.id as string;

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(true);

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
      router.push(`/questoes/${questionId}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuestion = async (questionData: QuestionFormData) => {
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
        tags: questionData.tags && questionData.tags.length > 0
          ? questionData.tags.filter((t: string) => t.trim())
          : null,
      };

      await api.put(`/questions/${questionId}`, apiData);

      toast({
        title: "Sucesso",
        description: "Questão atualizada com sucesso!",
      });

      router.push(`/questoes/${questionId}`);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.response?.data?.message || "Erro ao atualizar questão",
        variant: "destructive",
      });
    }
  };

  const handleCloseModal = () => {
    router.push(`/questoes/${questionId}`);
  };

  if (loading) {
    return <PageLoading message="Carregando questão..." />;
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <Link href={`/questoes/${questionId}`}>
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
      <QuestionModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSave={handleSaveQuestion}
        question={question}
        title="Editar Questão"
      />
    </div>
  );
}
