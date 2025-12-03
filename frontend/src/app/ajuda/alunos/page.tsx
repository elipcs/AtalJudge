"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function AjudaAlunos() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <Link href="/ajuda" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-blue-600">
            <ChevronLeft size={20} />
            <span className="text-sm">Voltar</span>
          </Link>
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Guia para Alunos</h1>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h2 className="text-lg font-bold text-blue-900 mb-4">Conteúdo desta página</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><a href="#submeter" className="text-blue-600 hover:underline">Como Submeter uma Solução</a></li>
            <li><a href="#resultados" className="text-blue-600 hover:underline">Entender os Resultados</a></li>
            <li><a href="#progresso" className="text-blue-600 hover:underline">Acompanhar seu Progresso</a></li>
          </ul>
        </Card>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        
        {/* Submeter Soluções */}
        <Card className="p-6 border-blue-200" id="submeter">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Como Submeter uma Solução</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">1.</span>
              <span>Na turma, acesse a seção "Listas" para ver as listas disponíveis</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">2.</span>
              <span>Clique em uma lista aberta para ver as questões</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">3.</span>
              <span>Selecione a questão que deseja resolver</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">4.</span>
              <span>Escreva seu código no editor</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">5.</span>
              <span>Escolha a linguagem de programação disponível (Python ou Java)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">6.</span>
              <span>Clique em "Submeter" para enviar sua solução</span>
            </li>
          </ol>
        </Card>

        {/* Ver Resultados */}
        <Card className="p-6 border-blue-200" id="resultados">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Entender os Resultados</h2>
          <div className="space-y-3">
            <div className="flex gap-3">
              <span className="font-bold text-green-600 flex-shrink-0">AC</span>
              <div>
                <p className="font-semibold text-slate-900">Aceito (Correto)</p>
                <p className="text-sm text-slate-600">Sua solução passou em todos os testes</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-red-600 flex-shrink-0">WA</span>
              <div>
                <p className="font-semibold text-slate-900">Resposta Errada</p>
                <p className="text-sm text-slate-600">O resultado não corresponde à saída esperada</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-orange-600 flex-shrink-0">CE</span>
              <div>
                <p className="font-semibold text-slate-900">Erro de Compilação</p>
                <p className="text-sm text-slate-600">Seu código tem erros de sintaxe</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-yellow-600 flex-shrink-0">TLE</span>
              <div>
                <p className="font-semibold text-slate-900">Tempo Excedido</p>
                <p className="text-sm text-slate-600">Seu código levou muito tempo para executar</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-600 flex-shrink-0">MLE</span>
              <div>
                <p className="font-semibold text-slate-900">Memória Excedida</p>
                <p className="text-sm text-slate-600">Seu código usou muita memória</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Acompanhar Progresso */}
        <Card className="p-6 border-blue-200" id="progresso">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Acompanhar seu Progresso</h2>
          <div className="space-y-3 text-slate-700">
            <p>• Acesse a seção "Submissões" para ver todas as suas soluções</p>
            <p>• Filtre por lista ou questão para ver submissões específicas</p>
            <p>• Revise seu código anterior e o histórico de tentativas</p>
            <p>• Você pode submeter quantas vezes quiser até acertar</p>
          </div>
        </Card>

      </div>
    </div>
  );
}
