"use client";

import { useState } from "react";

import { AuthInput, PasswordValidation } from "./index";

interface RegistrationFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentRegistration?: string;
}

interface RegistrationFormProps {
  onSubmit: (formData: RegistrationFormData) => void;
  loading?: boolean;
  tokenInfo?: {
    role: 'student' | 'assistant' | 'professor';
    classId?: string;
    className?: string;
  };
}

export function RegistrationForm({ onSubmit, loading = false, tokenInfo }: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentRegistration: "",
    password: "",
    confirmPassword: ""
  });

  const handleInputChange = (field: string, value: string) => {
    if (field === 'studentRegistration') {
      value = value.replace(/\D/g, '');
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const submitIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
  );

  return (
    <div className="space-y-3 sm:space-y-4">
      {tokenInfo?.role === 'student' && tokenInfo?.className && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 mb-4">
          <div className="flex justify-center items-center gap-1">
            <span className="text-xs sm:text-sm text-slate-600 font-medium">Turma:</span>
            <span className="text-xs sm:text-sm font-bold text-slate-900">{tokenInfo.className}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        <div className="space-y-2 sm:space-y-3">
          <AuthInput
            type="text"
            placeholder="Nome completo"
            value={formData.name}
            onChange={(value) => handleInputChange('name', value)}
            required
            autoComplete="name"
          />

          <AuthInput
            type="email"
            placeholder="Email institucional"
            value={formData.email}
            onChange={(value) => handleInputChange('email', value)}
            required
            autoComplete="email"
          />

          {tokenInfo?.role === 'student' && (
            <AuthInput
              type="tel"
              inputMode="numeric"
              placeholder="Matrícula"
              value={formData.studentRegistration}
              onChange={(value) => handleInputChange('studentRegistration', value)}
              required
            />
          )}

          <div>
            <AuthInput
              type="password"
              placeholder="Senha"
              value={formData.password}
              onChange={(value) => handleInputChange('password', value)}
              required
              autoComplete="new-password"
            />
            <PasswordValidation password={formData.password} minLength={8} />
          </div>

          <AuthInput
            type="password"
            placeholder="Confirmar senha"
            value={formData.confirmPassword}
            onChange={(value) => handleInputChange('confirmPassword', value)}
            required
            autoComplete="new-password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
              Cadastrando...
            </div>
          ) : (
            <>
              {submitIcon}
              Finalizar Cadastro
            </>
          )}
        </button>
      </form>
    </div>
  );
}
