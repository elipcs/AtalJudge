"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useStudentHomeData } from "../../hooks/useHomeData";
import { Student, User } from "@/types";
import { formatDateTime } from "../../utils/dateUtils";
import { createBrazilianDate } from "../../utils";

import WelcomeHeader from "./WelcomeHeader";

interface StudentHomeProps {
  currentUser: User;
}

export default function StudentHome({ currentUser }: StudentHomeProps) {
  const { data } = useStudentHomeData();
  const [countdownText, setCountdownText] = useState<string>("");

  const { highlightList, highlightCategory, currentStudent } = useMemo(() => {
    if (!data) {
      return { highlightList: null, highlightCategory: null as null | 'open' | 'next' | 'last', currentStudent: null };
    }

    const { availableLists, classParticipants } = data;
    const now = new Date();
    const lists = Array.isArray(availableLists) ? availableLists : [];

    const parseRange = (l: any) => {
      const start = createBrazilianDate(l.startDate);
      const end = createBrazilianDate(l.endDate);
      return { start, end };
    };

    const openLists = lists
      .filter(l => {
        const { start, end } = parseRange(l);
        if (!start || !end) return false;
        return now >= start && now <= end;
      })
      .sort((a, b) => {
        const ea = createBrazilianDate(a.endDate)!.getTime();
        const eb = createBrazilianDate(b.endDate)!.getTime();
        return ea - eb;
      });

    const nextLists = lists
      .filter(l => {
        const { start } = parseRange(l);
        return !!start && start > now;
      })
      .sort((a, b) => {
        const sa = createBrazilianDate(a.startDate)!.getTime();
        const sb = createBrazilianDate(b.startDate)!.getTime();
        return sa - sb;
      });

    const closedLists = lists
      .filter(l => {
        const { end } = parseRange(l);
        return !!end && end < now;
      })
      .sort((a, b) => {
        const ea = createBrazilianDate(a.endDate)!.getTime();
        const eb = createBrazilianDate(b.endDate)!.getTime();
        return eb - ea;
      });

    let highlight = null as any;
    let category: null | 'open' | 'next' | 'last' = null;

    if (openLists.length > 0) {
      highlight = openLists[0];
      category = 'open';
    } else if (nextLists.length > 0) {
      highlight = nextLists[0];
      category = 'next';
    } else if (closedLists.length > 0) {
      highlight = closedLists[0];
      category = 'last';
    }

    const student = classParticipants.find((classParticipant: Student) => classParticipant.name === currentUser.name) || {
      id: currentUser.id,
      name: currentUser.name,
      email: currentUser.email,
      studentRegistration: '20241001',
    };

    return { highlightList: highlight, highlightCategory: category, currentStudent: student };
  }, [data, currentUser]);

  useEffect(() => {
    if (!highlightList || !highlightCategory) {
      if (countdownText !== "") setTimeout(() => setCountdownText(""), 0);
      return;
    }

    const targetDateStr = highlightCategory === 'open' ? highlightList.endDate : highlightList.startDate;
    const target = createBrazilianDate(targetDateStr);
    if (!target) {
      setTimeout(() => setCountdownText(""), 0);
      return;
    }

    const formatDuration = (ms: number) => {
      if (ms <= 0) return 'menos de 1 min';
      const totalMinutes = Math.floor(ms / 60000);
      const days = Math.floor(totalMinutes / (60 * 24));
      const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      const minutes = totalMinutes % 60;
      const parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0 && days === 0) parts.push(`${minutes}m`);
      return parts.join(' ');
    };

    const updateCountdown = () => {
      const now = new Date();
      const diff = target.getTime() - now.getTime();
      if (highlightCategory === 'open') {
        setCountdownText(`Encerra em ${formatDuration(diff)}`);
      } else if (highlightCategory === 'next') {
        setCountdownText(`Começa em ${formatDuration(diff)}`);
      } else {
        setCountdownText("");
      }
    };

    setTimeout(updateCountdown, 0);
    const id = setInterval(updateCountdown, 60000);
    return () => clearInterval(id);
  }, [highlightList, highlightCategory, countdownText]);

  const currentClass = data?.currentClass || { id: '', name: 'Carregando...', professorId: '', professorName: 'Carregando...' };
  const classParticipants = data?.classParticipants || [];

  return (
    <div className="space-y-6">
      <WelcomeHeader
        currentUser={currentUser}
        title={`Bem-vindo(a), ${currentUser.name.split(' ')[0]}!`}
        subtitle={currentClass.name}
        extraInfo={<span>Professor: {currentClass.professorName}</span>}
      />

      {highlightList ? (
        <Link href={`/listas/detalhes?id=${highlightList.id}`} className="block group" tabIndex={-1} style={{ textDecoration: 'none' }}>
          <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg cursor-pointer group-hover:shadow-xl transition-shadow">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-600 rounded-xl border border-green-200">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {highlightCategory === 'open' && 'Lista Disponível'}
                    {highlightCategory === 'next' && 'Próxima Lista'}
                    {highlightCategory === 'last' && 'Última Lista'}
                  </h2>
                </div>
                <p className="text-slate-600">
                  {highlightCategory === 'open' && 'Você pode submeter suas soluções agora'}
                  {highlightCategory === 'next' && 'Aguarde o início para submeter suas soluções'}
                  {highlightCategory === 'last' && 'Você pode revisar suas submissões'}
                </p>
              </div>
              <span className={`px-4 py-2 rounded-xl text-sm font-medium border ${highlightCategory === 'open'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200'
                  : highlightCategory === 'next'
                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200'
                    : 'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border-slate-200'
                }`}>
                {highlightCategory === 'open' && 'Disponível'}
                {highlightCategory === 'next' && 'Em breve'}
                {highlightCategory === 'last' && 'Encerrada'}
              </span>
            </div>

            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 cursor-pointer hover:underline mb-0">{highlightList.title}</h3>
                {countdownText && (
                  <span className="text-xs px-2 py-1 rounded-full bg-slate-200 text-slate-700 font-medium">{countdownText}</span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-600">Início:</span>
                  <span className="font-medium text-slate-900">
                    {formatDateTime(highlightList.startDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-600">Fim:</span>
                  <span className="font-medium text-slate-900">
                    {formatDateTime(highlightList.endDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              {highlightCategory === 'next' ? (
                <Button
                  disabled
                  aria-disabled
                  title="A lista ainda não começou"
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 opacity-60 cursor-not-allowed font-semibold"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Acessar Lista
                </Button>
              ) : (
                <Button className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Acessar Lista
                </Button>
              )}
              {highlightCategory === 'next' ? (
                <Button
                  variant="outline"
                  disabled
                  aria-disabled
                  title="As submissões ficarão disponíveis quando a lista começar"
                  className="border-slate-300 text-slate-700 opacity-60 cursor-not-allowed font-semibold"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver Submissões
                </Button>
              ) : (
                <Button
                  variant="outline"
                  className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200"
                  onClick={e => {
                    e.stopPropagation();
                    window.location.href = `/submissoes?lista=${highlightList.id}`;
                  }}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Ver Submissões
                </Button>
              )}
            </div>
          </Card>
        </Link>
      ) : (
        <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl border border-slate-200">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Nenhuma lista disponível</h2>
              <p className="text-slate-600">No momento, não há listas em andamento ou agendadas para sua turma.</p>
            </div>
          </div>
        </Card>
      )}

      <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl border border-slate-200">
              <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Alunos da Turma</h2>
          </div>
          <span className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200">
            {classParticipants.length} alunos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Nome</th>
                <th className="text-left py-4 px-4 font-semibold text-slate-700">Matrícula</th>
              </tr>
            </thead>
            <tbody>
              {classParticipants.map((classParticipant: Student) => (
                <tr key={classParticipant.id} className={`border-b border-slate-100 ${classParticipant.id === currentStudent?.id ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'hover:bg-slate-50'}`}>
                  <td className="py-4 px-4">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${classParticipant.id === currentStudent?.id ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600' : 'bg-slate-100 text-slate-600'}`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div>
                        <div className={`font-semibold ${classParticipant.id === currentStudent?.id ? 'text-blue-700' : 'text-slate-900'}`}>
                          {classParticipant.name}
                          {classParticipant.id === currentStudent?.id && (
                            <span className="ml-2 text-xs bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                              Você
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600">{classParticipant.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-900 font-semibold">{classParticipant.studentRegistration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
