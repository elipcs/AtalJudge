"use client";

import React from "react";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Class, Student, QuestionList } from "../../types";
import { useListsData } from "../../hooks/useListsData";
import { InlineLoading } from "../PageLoading";

interface ClassDetailsProps {
  classDetails: {
    cls: Class;
    students: Student[];
  };
  userRole: string;
  currentUserId?: string;
  onBack: () => void;
  onEditClass?: (cls: Class) => void;
  onDeleteClass?: (cls: Class) => void;
  loading?: boolean;
}

export default function ClassDetails({ 
  classDetails, 
  userRole,
  currentUserId,
  onBack: _onBack,
  onEditClass: _onEditClass,
  onDeleteClass: _onDeleteClass,
  loading = false 
}: ClassDetailsProps) {
  const { cls, students } = classDetails;
  
  const currentStudent = userRole === 'student' && currentUserId 
    ? students.find(s => s.id === currentUserId)
    : null;
  
  const { lists: allLists, loading: listsLoading } = useListsData();
  const questionLists = allLists.filter((list: QuestionList) =>
    list.classIds && list.classIds.includes(cls.id)
  );

  const exportToCSV = () => {
    const listsForGrade = questionLists.filter((list: QuestionList) => list.countTowardScore !== false);
    
    const headers = ['Nome', 'Email', 'Matrícula', 'Média Geral'];
    listsForGrade.forEach(list => {
      headers.push(list.title);
    });
    headers.push('Data de Matrícula');

    const csvContent = [
      headers.join(','),
      ...students.map(student => {
        const row = [
          `"${student.name}"`,
          `"${student.email}"`,
          `"${student.studentRegistration}"`,
          calculateAverageGrade(student.grades).toFixed(1)
        ];
        
        listsForGrade.forEach(list => {
          const gradeObj = student.grades?.find(g => g.questionListId === list.id);
          const grade = gradeObj ? parseFloat(String(gradeObj.score)) : 0;
          row.push(grade.toFixed(1));
        });
        
        row.push(`"${new Date(student.createdAt).toLocaleDateString('pt-BR')}"`);
        return row.join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `turma_${cls.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading || listsLoading) {
    return <InlineLoading message="Carregando detalhes..." />;
  }

  const calculateAverageGrade = (grades: { id: string; questionListId: string; score: string | number; createdAt: string; updatedAt: string }[] = []) => {
    if (grades.length === 0) return 0;
    
    const gradesForScore = grades.filter(grade => {
      const list = questionLists.find((l: QuestionList) => l.id === grade.questionListId);
      return list && list.countTowardScore !== false;
    });
    
    if (gradesForScore.length === 0) return 0;
    const sum = gradesForScore.reduce((acc, grade) => acc + parseFloat(String(grade.score)), 0);
    return sum / gradesForScore.length;
  };

  return (
    <div className="space-y-6">
      {userRole === 'student' && currentStudent && (
        <Card className="bg-white border-slate-200 rounded-2xl shadow-xl p-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-xl flex items-center justify-center border border-slate-200">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Minhas Notas</h2>
                  <p className="text-slate-500 text-xs">Desempenho nas listas</p>
                </div>
              </div>
              
              <div className="bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                <p className="text-slate-700 text-xs font-semibold">
                  {currentStudent.grades?.filter(g => parseFloat(String(g.score)) > 0).length || 0}/{questionLists.length}
                </p>
              </div>
            </div>

            {questionLists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                {questionLists.map((list) => {
                  const gradeObj = currentStudent.grades?.find(g => g.questionListId === list.id);
                  const gradeValue = gradeObj ? parseFloat(String(gradeObj.score)) : 0;
                  const hasGrade = gradeValue > 0;
                  
                  return (
                    <div 
                      key={list.id}
                      className="bg-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-bold text-slate-800 truncate flex-1 pr-2" title={list.title}>
                          {list.title}
                        </h3>
                        {hasGrade && (
                          <div className="w-5 h-5 rounded-lg flex items-center justify-center bg-slate-100 border border-slate-200">
                            <svg className="w-3 h-3 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              {gradeValue >= 7 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              ) : gradeValue >= 5 ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                              ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              )}
                            </svg>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-end justify-between">
                        <p className={`text-2xl font-bold ${
                          gradeValue >= 7 ? 'text-green-600' :
                          gradeValue >= 5 ? 'text-yellow-600' :
                          gradeValue > 0 ? 'text-red-600' :
                          'text-slate-300'
                        }`}>
                          {hasGrade ? gradeValue.toFixed(1) : '-'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200 mb-4">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-700 text-sm font-semibold">Nenhuma lista disponível</p>
              </div>
            )}
            
            <div className="bg-white rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 border border-slate-200">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-semibold">Média Geral</p>
                    <p className="text-[10px] text-slate-400">Todas as listas</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className={`text-3xl font-bold ${
                    calculateAverageGrade(currentStudent.grades) >= 7 ? 'text-green-600' :
                    calculateAverageGrade(currentStudent.grades) >= 5 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {calculateAverageGrade(currentStudent.grades).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">
            Alunos da Turma ({students.length})
          </h2>
          {(userRole === 'professor' || userRole === 'assistant') && students.length > 0 && (
            <Button 
              onClick={exportToCSV}
              className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </Button>
          )}
        </div>

        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-lg border border-slate-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-4">Nenhum aluno matriculado</h3>
            <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto">Esta turma ainda não possui alunos matriculados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-slate-100">
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Nome</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-slate-700">Matrícula</th>
                  {userRole !== 'student' && (
                    <>
                      {questionLists.map((list) => (
                        <th key={list.id} className="text-left py-4 px-6 font-semibold text-slate-700">
                          <div className="max-w-24">
                            <div className="text-xs text-slate-500 truncate" title={list.title}>
                              {list.title}
                            </div>
                          </div>
                        </th>
                      ))}
                      <th className="text-left py-4 px-6 font-semibold text-slate-700">Média</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {[...students].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map((student) => {
                  const average = calculateAverageGrade(student.grades);
                  return (
                    <tr key={student.id} className="border-b border-slate-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-200">
                            <span className="text-blue-600 font-semibold text-sm">
                              {student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="font-semibold text-slate-900">{student.name}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-900">{student.email}</td>
                      <td className="py-4 px-6 text-slate-900">{student.studentRegistration || '-'}</td>
                      {userRole !== 'student' && (
                        <>
                          {questionLists.map((list) => {
                            const gradeObj = student.grades?.find(g => g.questionListId === list.id);
                            const gradeValue = gradeObj ? parseFloat(String(gradeObj.score)) : 0;
                            return (
                              <td key={list.id} className="py-4 px-6">
                                <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
                                  gradeValue >= 7 ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' :
                                  gradeValue >= 5 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200' :
                                  gradeValue > 0 ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200' :
                                  'bg-gradient-to-r from-slate-50 to-slate-100 text-slate-500 border border-slate-200'
                                }`}>
                                  {gradeValue > 0 ? gradeValue.toFixed(1) : '-'}
                                </span>
                              </td>
                            );
                          })}
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-medium ${
                              average >= 7 ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200' :
                              average >= 5 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border border-yellow-200' :
                              'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200'
                            }`}>
                              {average.toFixed(1)}
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-medium">{students.length} aluno{students.length !== 1 ? 's' : ''}</span>
            </div>
            {userRole !== 'student' && (
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">
                  Média geral: {students.length > 0 
                    ? (students.reduce((sum, student) => sum + calculateAverageGrade(student.grades), 0) / students.length).toFixed(1)
                    : '0.0'
                  }
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Criada em {new Date(cls.createdAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
