"use client";

import { useState, useEffect } from "react";

import { useUserRole } from "../../hooks/useUserRole";
import { useCurrentUser } from "../../hooks/useHomeData";
import { 
  StudentHome,
  StaffHome
} from "../../components/home";

export default function HomePage() {
  const { isLoading: userRoleLoading } = useUserRole();
  const { data: currentUser, loading: userLoading, error: userError } = useCurrentUser();
  
  const isLoading = userRoleLoading || userLoading;
  
  const [showContent, setShowContent] = useState(false);
  const [hasShownError, setHasShownError] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContent(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const id = setTimeout(() => setHasShownError(false), 0);
      return () => clearTimeout(id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (showContent && !isLoading && (currentUser || (userError && !currentUser))) {
      const id = setTimeout(() => setIsReady(true), 0);
      return () => clearTimeout(id);
    }
  }, [showContent, isLoading, currentUser, userError]);

  useEffect(() => {
    if (userError && (userError.includes('Token expirado') || userError.includes('Não autorizado') || userError.includes('401'))) {
      window.location.href = '/login';
    }
  }, [userError]);

  const hasToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  useEffect(() => {
    if (!hasToken && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [hasToken]);

  if (!hasToken) {
    return null;
  }

  if (!showContent || isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Carregando...</h1>
            <p className="text-slate-600">Preparando sua área de trabalho</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    switch (currentUser.role) {
      case 'professor':
      case 'assistant':
        return <StaffHome currentUser={currentUser} userRole={currentUser.role} />;
      
      case 'student':
        return <StudentHome currentUser={currentUser} />;

      default:
        return (
          <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
            <div className="w-full max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
                <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-600 rounded-xl shadow-lg border border-yellow-200 mx-auto mb-6 w-fit">
                  <svg className="w-16 h-16 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4">
                  Tipo de usuário não identificado
                </h1>
                <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8">
                  Por favor, verifique suas permissões ou contate o administrador.
                </p>
                <button 
                  onClick={() => window.location.href = '/'} 
                  className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
                >
                  Ir para Página Inicial
                </button>
              </div>
            </div>
          </div>
        );
    }
  }

  if (userError && !currentUser && !hasShownError) {
    setHasShownError(true);
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="w-full max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4">
              Erro ao carregar usuário
            </h1>
            <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-8">
              {userError}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

}