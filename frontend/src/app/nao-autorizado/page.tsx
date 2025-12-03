"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 sm:p-12 text-center">
          {}
          <div className="mb-8 flex justify-center">
            <div className="p-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl shadow-lg border border-red-200">
              <svg 
                className="w-16 h-16 text-white" 
                fill="none" 
                stroke="white" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent mb-4 leading-tight">
                Acesso Negado
              </h1>
              <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto">
                Você não tem permissão para acessar esta página. Esta área é restrita a usuários com privilégios específicos.
              </p>
            </div>

            {}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/home" className="flex-1 sm:flex-none">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Ir para Home
                </Button>
              </Link>
              
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('refreshToken');
                  window.location.href = '/';
                }}
                className="flex-1 sm:flex-none"
              >
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border border-red-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sair
                </Button>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
