"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { authApi } from "@/services/auth";
import { logger } from "@/utils/logger";

interface LogoutButtonProps {
  isCollapsed?: boolean;
}

export default function LogoutButton({ isCollapsed = false }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  async function handleLogout() {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      const success = await authApi.logout();
      if (success) {
        router.push("/");
      } else {
        router.push("/");
      }
    } catch (error) {
      router.push("/");
    } finally {
      setIsLoggingOut(false);
    }
  }
  
  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`flex ${isCollapsed ? 'justify-center items-center' : 'items-center gap-3'} text-sm font-medium rounded-xl transition-all duration-300 ease-in-out relative group text-slate-600 hover:text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed ${
        isCollapsed ? 'w-12 h-12' : 'px-4 py-3'
      }`}
      title={isCollapsed ? (isLoggingOut ? "Saindo..." : "Sair") : undefined}
    >
      <span className={`text-slate-400 group-hover:text-red-500 flex-shrink-0 transition-colors duration-300 ease-in-out ${isCollapsed ? 'mx-auto' : ''}`}>
        {isLoggingOut ? (
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        )}
      </span>
      <span className={`truncate transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
      }`}>
        {isLoggingOut ? 'Saindo...' : 'Sair'}
      </span>
      {}
      {isCollapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </div>
      )}
    </button>
  );
}
