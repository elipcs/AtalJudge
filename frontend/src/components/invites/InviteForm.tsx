"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { useInviteForm } from "../../hooks/useInviteForm";
import { invitesApi } from "../../services/invites";
import { profileApi } from "../../services/profile";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/utils/logger";

interface InviteFormProps {
  onInviteCreated: () => void;
}

export function InviteForm({ onInviteCreated }: InviteFormProps) {
  const [loading, setLoading] = useState(false);
  const {
    formData,
    availableClasses,
    classesLoading,
    classesError,
    isClassDropdownOpen,
    isExpirationDropdownOpen,
    updateFormData,
    resetForm,
    validateForm,
    setIsClassDropdownOpen,
    setIsExpirationDropdownOpen,
    loadClasses,
  } = useInviteForm();
  const { toast } = useToast();

  const createInvite = async () => {
    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Erro de validação",
        description: validationError,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      
      const userProfile = await profileApi.getProfile();
      const selectedClass = availableClasses.find(c => c.id === formData.classId);
      
      const inviteData = {
        role: formData.role,
        maxUses: formData.maxUses,
        expirationDays: formData.expirationDays,
        classId: formData.role === 'student' ? formData.classId : undefined,
        className: formData.role === 'student' ? selectedClass?.name : undefined,
        createdBy: userProfile.id,
        creatorName: userProfile.name
      };
      
      await invitesApi.create(inviteData);
      toast({
        description: "Convite criado com sucesso!",
        variant: "success",
      });
      onInviteCreated();
      resetForm();
    } catch (error) {
      toast({
        title: "Erro",
        description: 'Erro ao gerar convite: ' + (error instanceof Error ? error.message : 'Erro desconhecido'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { 
      value: 'student', 
      label: 'Aluno', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ), 
      description: 'Estudante da turma', 
      color: 'blue' 
    },
    { 
      value: 'assistant', 
      label: 'Monitor', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ), 
      description: 'Assistente do professor', 
      color: 'green' 
    },
    { 
      value: 'professor', 
      label: 'Professor', 
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ), 
      description: 'Instrutor da disciplina', 
      color: 'purple' 
    }
  ];

  const expirationOptions = [
    { value: 1, label: '1 dia' },
    { value: 7, label: '7 dias' },
    { value: 30, label: '30 dias' },
    { value: 90, label: '90 dias' }
  ];

  return (
    <Card className="p-6 mb-8 overflow-visible">
      <h2 className="text-xl font-semibold mb-6">Gerar Novo Convite</h2>
      
      {}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">Tipo de Usuário</label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {roleOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => updateFormData({ role: option.value as any })}
              className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                formData.role === option.value
                  ? option.color === 'blue' 
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : option.color === 'green'
                    ? 'border-green-500 bg-green-50 shadow-md'
                    : 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`${
                  formData.role === option.value 
                    ? option.color === 'blue' 
                      ? 'text-blue-600'
                      : option.color === 'green'
                      ? 'text-green-600'
                      : 'text-purple-600'
                    : 'text-gray-500'
                }`}>
                  {option.icon}
                </div>
                <div>
                  <div className={`font-medium ${
                    formData.role === option.value 
                      ? option.color === 'blue' 
                        ? 'text-blue-700'
                        : option.color === 'green'
                        ? 'text-green-700'
                        : 'text-purple-700'
                      : 'text-gray-900'
                  }`}>
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {option.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {formData.role === 'student' && (
          <div className="md:col-span-2 lg:col-span-1 relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">Turma</label>
            <div className="relative class-dropdown-container">
              <button
                type="button"
                onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 cursor-pointer shadow-sm"
              >
                <span className={formData.classId ? 'text-gray-900' : 'text-gray-500'}>
                  {formData.classId ? availableClasses.find(cls => cls.id === formData.classId)?.name : 'Selecione uma turma'}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                    isClassDropdownOpen ? 'rotate-180' : ''
                  }`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isClassDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                  {!formData.classId && (
                    <button
                      type="button"
                      onClick={() => {
                        updateFormData({ classId: '' });
                        setIsClassDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-gray-500 hover:bg-blue-50 transition-colors border-b border-gray-100"
                    >
                      Selecione uma turma
                    </button>
                  )}
                  {availableClasses.map((cls, index) => (
                    <button
                      key={cls.id}
                      type="button"
                      onClick={() => {
                        updateFormData({ classId: cls.id });
                        setIsClassDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left transition-colors ${
                        formData.classId === cls.id 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-900 hover:bg-gray-50'
                      } ${index < availableClasses.length - 1 || !formData.classId ? 'border-b border-gray-100' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{cls.name}</span>
                        {formData.classId === cls.id && (
                          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {classesLoading && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Carregando turmas...
                </p>
              </div>
            )}
            
            {classesError && (
              <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Erro ao carregar turmas: {classesError}
                </p>
                <button 
                  onClick={loadClasses}
                  className="mt-2 text-xs text-red-600 underline hover:text-red-800"
                >
                  Tentar novamente
                </button>
              </div>
            )}
            
            {!classesLoading && !classesError && availableClasses.length === 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Você precisa <a href="/turmas" className="underline font-medium hover:text-amber-800">criar uma turma</a> primeiro
                </p>
              </div>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Máximo de Usos</label>
          <div className="relative">
            <input 
              type="number" 
              value={formData.maxUses} 
              onChange={e => updateFormData({ maxUses: parseInt(e.target.value) })}
              min="1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">Validade do Convite</label>
          <div className="relative expiration-dropdown-container">
            <button
              type="button"
              onClick={() => setIsExpirationDropdownOpen(!isExpirationDropdownOpen)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-left flex items-center justify-between bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 cursor-pointer shadow-sm"
            >
              <span className="text-gray-900">
                {expirationOptions.find(opt => opt.value === formData.expirationDays)?.label || '7 dias'}
              </span>
              <svg 
                className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
                  isExpirationDropdownOpen ? 'rotate-180' : ''
                }`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            {isExpirationDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-xl overflow-y-auto max-h-64">
                {expirationOptions.map((option, index) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      updateFormData({ expirationDays: option.value });
                      setIsExpirationDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left transition-colors ${
                      formData.expirationDays === option.value 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'text-gray-900 hover:bg-gray-50'
                    } ${index < expirationOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option.label}</span>
                      {formData.expirationDays === option.value && (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={createInvite}
          disabled={loading || (formData.role === 'student' && !formData.classId)}
          className={`shadow-sm hover:shadow-md font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-8 py-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 flex items-center`}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2 border-blue-600"></div>
              Gerando Convite...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Gerar Convite
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
