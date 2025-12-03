"use client";

import { useState, useEffect, useCallback } from "react";

import { Button } from "../ui/button";
import { MESSAGES } from "../../constants";
import { API } from "../../config/api";
import { logger } from "../../utils";

import { AuthLayout } from "./index";

interface TokenInfo {
  role: 'student' | 'assistant' | 'professor';
  class?: string;
  professor?: string;
  valid: boolean;
  expires: string;
}

interface TokenValidationProps {
  token: string;
  onTokenValidated: (tokenInfo: TokenInfo | null) => void;
  children: React.ReactNode;
}

export function TokenValidation({ token, onTokenValidated, children }: TokenValidationProps) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [, setError] = useState("");

  const validateToken = useCallback(async (tokenValue: string) => {
    setLoading(true);
    setError("");
    
    try {
      const response = await API.invites.verify(tokenValue);
      
      const result = response.data as any;

      if (!response.success || !result || !result.id) {
        setTokenInfo({
          role: 'student',
          valid: false,
          expires: ''
        });
        setError(result?.error || MESSAGES.ERROR_GENERIC);
        onTokenValidated(null);
        return;
      }
      
      const data = result;
      const validatedTokenInfo = {
        role: data.role,
        classId: data.classId,
        className: data.className,
        professor: data.createdBy,
        valid: true,
        expires: new Date(data.expiresAt).toLocaleDateString('pt-BR')
      };
      
      setTokenInfo(validatedTokenInfo);
      onTokenValidated(validatedTokenInfo);

    } catch (error) {
      setError(MESSAGES.ERROR_GENERIC);
      setTokenInfo({
        role: 'student',
        valid: false,
        expires: ''
      });
      onTokenValidated(null);
    } finally {
      setLoading(false);
    }
  }, [onTokenValidated]);

  useEffect(() => {
    if (token) {
      validateToken(token);
    } else {
      onTokenValidated(null);
    }
  }, [token, validateToken, onTokenValidated]);

  if (loading) {
    return (
      <AuthLayout 
        title="Verificando acesso..."
        subtitle="Aguarde enquanto validamos o token"
        showLogo={false}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-800 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando acesso...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!token) {
    return (
      <AuthLayout 
        title="Cadastro por Convite"
        subtitle="Para acessar esta página, você precisa de um link com token de cadastro fornecido pelo seu professor."
      >
        
        <Button 
          onClick={() => window.location.href = '/'} 
          variant="outline"
          size="lg"
          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          Voltar para Página Inicial
        </Button>
      </AuthLayout>
    );
  }

  if (tokenInfo && !tokenInfo.valid) {
    return (
      <AuthLayout 
        title="Token Inválido"
        subtitle="O token fornecido é inválido ou já expirou."
        showLogo={false}
      >
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <Button 
            onClick={() => window.location.href = '/'} 
            variant="outline"
            size="lg"
            className="w-full border-red-300 text-red-700 hover:bg-red-50"
          >
            Voltar para Página Inicial
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return <>{children}</>;
}
