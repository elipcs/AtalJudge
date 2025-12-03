"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Users, Home } from "lucide-react";

interface ClassesErrorProps {
  error: string;
  onRetry?: () => void;
  onGoToInvites?: () => void;
  onGoToHome?: () => void;
}

export default function ClassesError({ 
  error, 
  onRetry, 
  onGoToInvites, 
  onGoToHome 
}: ClassesErrorProps) {
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoToInvites = () => {
    if (onGoToInvites) {
      onGoToInvites();
    } else {
      window.location.href = '/convites';
    }
  };

  const handleGoToHome = () => {
    if (onGoToHome) {
      onGoToHome();
    } else {
      window.location.href = '/home';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 sm:p-12 text-center">
          {}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-pink-500 rounded-full blur-lg opacity-20 scale-110"></div>
            <div className="relative bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-2xl shadow-lg border border-red-200 mx-auto w-fit p-6">
              <AlertCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>

          {}
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 via-pink-600 to-red-700 bg-clip-text text-transparent mb-4">
            Ops! Algo deu errado
          </h1>

          {}
          <p className="text-slate-600 text-lg sm:text-xl leading-relaxed max-w-lg mx-auto mb-2">
            Não foi possível carregar suas turmas no momento.
          </p>
          
          {}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 max-w-md mx-auto">
            <p className="text-sm text-slate-500 font-mono break-words">
              {error}
            </p>
          </div>

          {}
          <div className="space-y-4">
            {}
            <Button
              onClick={handleRetry}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl font-semibold"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Tentar Novamente
            </Button>

            {}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                onClick={handleGoToInvites}
                variant="outline"
                className="w-full bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200 hover:from-green-100 hover:to-emerald-100 hover:border-green-300 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl font-semibold"
              >
                <Users className="w-5 h-5 mr-2" />
                Convites
              </Button>

              <Button
                onClick={handleGoToHome}
                variant="outline"
                className="w-full bg-gradient-to-r from-slate-50 to-gray-50 text-slate-700 border-slate-200 hover:from-slate-100 hover:to-gray-100 hover:border-slate-300 shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.02] py-3 px-6 rounded-xl font-semibold"
              >
                <Home className="w-5 h-5 mr-2" />
                Início
              </Button>
            </div>
          </div>

          {}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700">
              💡 <strong>Dica:</strong> Se o problema persistir, verifique sua conexão com a internet ou entre em contato com o suporte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

