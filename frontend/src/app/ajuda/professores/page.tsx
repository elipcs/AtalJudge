"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronLeft } from "lucide-react";

export default function AjudaProfessores() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <Link href="/ajuda" className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity text-purple-600">
            <ChevronLeft size={20} />
            <span className="text-sm">Voltar</span>
          </Link>
          <h1 className="text-3xl font-bold text-purple-600 mb-2">Guia para Professores</h1>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <Card className="p-6 bg-purple-50 border-purple-200">
          <h2 className="text-lg font-bold text-purple-900 mb-4">Conteúdo desta página</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li><a href="#turma" className="text-purple-600 hover:underline">Criar uma Turma</a></li>
            <li><a href="#questoes" className="text-purple-600 hover:underline">Criar Questões</a></li>
            <li><a href="#testes" className="text-purple-600 hover:underline">Gerar Casos de Teste</a></li>
            <li><a href="#listas" className="text-purple-600 hover:underline">Criar e Editar Listas</a></li>
            <li><a href="#convites" className="text-purple-600 hover:underline">Criar Convites</a></li>
            <li><a href="#submissoes" className="text-purple-600 hover:underline">Acompanhar Submissões</a></li>
            <li><a href="#notas" className="text-purple-600 hover:underline">Exportar Notas</a></li>
            <li><a href="#reset" className="text-purple-600 hover:underline">Reset do Sistema</a></li>
            <li><a href="#ips" className="text-purple-600 hover:underline">Adicionar IPs Liberados</a></li>
            <li><a href="#membros" className="text-purple-600 hover:underline">Gerenciar Estudantes e Monitores</a></li>
          </ul>
        </Card>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Criar Turma */}
        <Card className="p-6 border-purple-200" id="turma">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Criar uma Turma</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>No menu principal, acesse "Turmas"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Clique em "Nova Turma"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Preencha o nome (ex: "ATAL")</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Clique em "Criar Turma"</span>
            </li>
          </ol>
        </Card>

        {/* Gerar Convites */}
        <Card className="p-6 border-purple-200" id="convites">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Criar Convites</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>No menu principal, acesse "Convites"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Clique em "Criar Convite"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Escolha o tipo: Aluno, Monitor ou Professor</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Se for aluno, selecione a turma correspondente</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>Clique em "Gerar Convite"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">6.</span>
              <span>Copie o link e compartilhe</span>
            </li>
          </ol>
        </Card>

        {/* Criar Questões */}
        <Card className="p-6 border-purple-200" id="questoes">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Criar Questões</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>No menu principal, acesse "Questões"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Clique em "Nova Questão"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Preencha o título, enunciado e os exemplos da questão</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Defina os limites de tempo e memória</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>Clique em "Criar Questão" para salvar</span>
            </li>
          </ol>
        </Card>

        {/* Gerar Casos de Teste */}
        <Card className="p-6 border-purple-200" id="testes">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Gerar Casos de Teste de uma Questão</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>Acesse "Questões" no menu principal</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Clique na questão que deseja editar</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Clique em "Casos de Teste"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Você pode gerar casos de teste automaticamente fornecendo um código correto</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>Ou adicionar casos manualmente: clique em "Novo Caso de Teste"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">6.</span>
              <span>Preencha a entrada (input) e a saída esperada (output)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">7.</span>
              <span>Clique em "Salvar" para confirmar o caso de teste</span>
            </li>
          </ol>
        </Card>

        {/* Criar e Editar Listas */}
        <Card className="p-6 border-purple-200" id="listas">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Criar e Editar Listas</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>No menu principal, acesse "Listas"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Clique em "Nova Lista" ou selecione uma lista existente para editar</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Configure o nome, descrição e datas de abertura/fechamento</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Selecione a turma para a qual deseja atribuir a lista</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>Clique em "Salvar" para criar ou atualizar a lista</span>
            </li>
          </ol>
        </Card>
        
        {/* Adicionar Questões à Lista */}
        <Card className="p-6 border-purple-200">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Adicionar Questões a uma Lista</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>Acesse "Listas" no menu principal</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Clique na lista que deseja editar</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Clique em "Adicionar Questão"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Selecione a questão do banco de questões</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>Clique em "Salvar" para confirmar</span>
            </li>
          </ol>
        </Card>


        {/* Acompanhar Submissões */}
        <Card className="p-6 border-purple-200" id="submissoes">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Acompanhar Submissões dos Alunos</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>Na turma, vá para "Submissões"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Veja todas as submissões em uma tabela</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Use filtros para encontrar por aluno, questão ou status</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Clique em uma submissão para ver detalhes do código</span>
            </li>
          </ol>
        </Card>

        {/* Exportar Notas */}
        <Card className="p-6 border-purple-200" id="notas">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Exportar Notas</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>No menu principal, acesse "Turmas"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Acesse a turma desejada</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Clique no botão "Exportar"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>O arquivo .CSV será baixado com as notas de todos os alunos</span>
            </li>
          </ol>
        </Card>

        {/* Reset do Sistema */}
        <Card className="p-6 border-purple-200" id="reset">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Reset do Sistema</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>Acesse "Configurações"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Acesse a aba "Reset do Sistema"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Clique em "Reset completo do sistema" ou selecione os campos que deseja limpar</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Confirme a ação (isso irá limpar todos os dados do sistema, menos o seu usuário)</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>O sistema será reiniciado com dados limpos</span>
            </li>
          </ol>
        </Card>

        {/* Adicionar IPs Liberados */}
        <Card className="p-6 border-purple-200" id="ips">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Adicionar IPs Liberados</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>Acesse "Configurações"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Acesse a aba "IPs Permitidos"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Digite o endereço IP que deseja liberar e uma descrição</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Clique em "Adicionar IP" para confirmar</span>
            </li>
          </ol>
        </Card>

        {/* Gerenciar Estudantes e Monitores */}
        <Card className="p-6 border-purple-200" id="membros">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Gerenciar Estudantes e Monitores</h2>
          <ol className="space-y-3 text-slate-700">
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">1.</span>
              <span>Acesse "Configurações"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">2.</span>
              <span>Acesse a aba "Gerenciar Usuários"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">3.</span>
              <span>Você verá uma de estudantes e monitores</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">4.</span>
              <span>Para remover alguém, clique em "Excluir Usuário"</span>
            </li>
            <li className="flex gap-3">
              <span className="font-bold text-purple-600 flex-shrink-0">5.</span>
              <span>Confirme a remoção</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}
