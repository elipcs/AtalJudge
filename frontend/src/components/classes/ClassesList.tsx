"use client";

import React from "react";

import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Class } from "../../types";
import { InlineLoading } from "../PageLoading";

interface ClassesListProps {
  classes: Class[];
  userRole: string;
  onViewDetails: (cls: Class) => void;
  onEditClass?: (cls: Class) => void;
  onDeleteClass?: (cls: Class) => void;
  loading?: boolean;
}

export default function ClassesList({ 
  classes, 
  userRole, 
  onViewDetails, 
  onEditClass,
  onDeleteClass,
  loading = false 
}: ClassesListProps) {
  if (loading) {
    return <InlineLoading message="Carregando turmas..." />;
  }

  return (
    <div className="space-y-6">
      {classes.length === 0 ? (
        <Card className="p-12 text-center bg-white border-slate-200 rounded-3xl shadow-lg">
          <div className="p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-600 rounded-xl shadow-lg border border-indigo-200 mx-auto mb-6 w-fit">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            {userRole === 'student' ? 'Nenhuma turma encontrada' : 'Nenhuma turma criada'}
          </h3>
          <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto">
            {userRole === 'student' 
              ? 'Você ainda não está matriculado em nenhuma turma.'
              : 'Comece criando sua primeira turma para organizar seus alunos.'
            }
          </p>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Card key={cls.id} className="p-6 hover:shadow-lg transition-shadow cursor-pointer" 
                  onClick={() => onViewDetails(cls)}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{cls.name}</h3>
                  <p className="text-sm text-gray-600">Prof. {cls.professor?.name || 'Desconhecido'}</p>
                </div>
                <div className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Ativa
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Alunos:</span>
                  <span className="font-medium text-gray-900">{cls.studentCount || 0}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Criada em:</span>
                  <span className="text-gray-900">
                    {new Date(cls.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails(cls);
                    }}
                  >
                    Ver Detalhes
                  </Button>
                  
                  {userRole === 'professor' && (
                    <>
                      {onEditClass && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditClass(cls);
                          }}
                          title="Editar turma"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Button>
                      )}
                      
                      {onDeleteClass && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteClass(cls);
                          }}
                          title="Excluir turma"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
