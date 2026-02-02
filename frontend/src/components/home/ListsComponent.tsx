"use client";

import React from "react";
import Link from "next/link";

import { Card } from "../ui/card";
import { useActiveLists } from "../../hooks/useHomeData";
import { QuestionList } from "../../types";
import { createBrazilianDate } from "../../utils";

export default function ListsComponent() {
  const { data: lists, loading, error } = useActiveLists() as {
    data: (QuestionList & { calculatedStatus: 'scheduled' | 'open' | 'closed' })[];
    loading: boolean;
    error: string | null;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
    const formattedTime = date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'America/Sao_Paulo'
    });
    return `${formattedDate} às ${formattedTime}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Listas Ativas</h3>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Carregando listas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Listas Ativas</h3>
        <div className="text-center py-8">
          <div className="text-red-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-lg font-medium text-red-600 mb-2">Erro ao carregar listas</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const listsArray = Array.isArray(lists) ? lists : [];

  if (!listsArray || listsArray.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Listas Ativas</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-lg font-medium text-gray-600 mb-2">Nenhuma lista encontrada</p>
            <p className="text-sm text-gray-500">Não há listas disponíveis no momento.</p>
          </div>
        </div>
      </div>
    );
  }

  const availableLists = listsArray.map((list: QuestionList & { calculatedStatus: 'scheduled' | 'open' | 'closed' }) => {
    const now = new Date();
    const start = createBrazilianDate(list.startDate);
    const end = createBrazilianDate(list.endDate);

    let status: 'open' | 'closed' = 'closed';
    if (start && end && now >= start && now <= end) {
      status = 'open';
    }

    return {
      id: list.id,
      title: list.title,
      description: list.description,
      classIds: list.classIds.map(id => ({ $oid: id })),
      questions: list.questions,
      questionCount: list.questionCount ?? list.questions?.length ?? 0,
      startDate: list.startDate,
      endDate: list.endDate,
      status,
      calculatedStatus: list.calculatedStatus,
    };
  });

  if (availableLists.length === 0) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Listas Ativas</h3>
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-lg font-medium text-gray-600 mb-2">Nenhuma lista encontrada</p>
            <p className="text-sm text-gray-500">Não há listas disponíveis no momento.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Listas Ativas</h3>
      <div className="grid gap-4">
        {availableLists.slice(0, 3).map((list) => {
          const listWithStatus = list as unknown as QuestionList & { calculatedStatus: 'scheduled' | 'open' | 'closed' };
          return (
            <Card key={listWithStatus.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {listWithStatus.calculatedStatus === 'open' ? (
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : listWithStatus.calculatedStatus === 'scheduled' ? (
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    <Link href={`/listas/detalhes?id=${listWithStatus.id}`} className="text-lg font-medium text-gray-900 hover:text-blue-600">
                      {listWithStatus.title}
                    </Link>
                  </div>
                  <p className="text-gray-600 text-sm mb-2">{listWithStatus.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{listWithStatus.questionCount ?? listWithStatus.questions?.length ?? 0} questões</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="flex flex-col">
                        <span className={`font-medium ${listWithStatus.calculatedStatus === 'open' ? 'text-green-700' :
                          listWithStatus.calculatedStatus === 'scheduled' ? 'text-blue-700' : 'text-red-700'
                          }`}>
                          {listWithStatus.calculatedStatus === 'open' && listWithStatus.endDate
                            ? `Encerra em ${formatDateTime(listWithStatus.endDate)}`
                            : listWithStatus.calculatedStatus === 'scheduled' && listWithStatus.startDate
                              ? `Inicia em ${formatDateTime(listWithStatus.startDate)}`
                              : listWithStatus.calculatedStatus === 'closed' && listWithStatus.endDate
                                ? `Encerrou em ${formatDateTime(listWithStatus.endDate)}`
                                : 'Sem data definida'
                          }
                        </span>
                        {listWithStatus.startDate && listWithStatus.calculatedStatus !== 'scheduled' && (
                          <span className="text-xs text-gray-500 mt-1">
                            Iniciou em {formatDateTime(listWithStatus.startDate)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${listWithStatus.calculatedStatus === 'open'
                  ? 'bg-green-100 text-green-800'
                  : listWithStatus.calculatedStatus === 'scheduled'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {listWithStatus.calculatedStatus === 'open' ? 'Aberta' :
                    listWithStatus.calculatedStatus === 'scheduled' ? 'Agendada' : 'Encerrada'}
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {availableLists.length > 3 && (
        <div className="text-center">
          <Link href="/listas" className="text-blue-600 hover:text-blue-800 font-medium">
            Ver todas as listas →
          </Link>
        </div>
      )}
    </div>
  );
}
