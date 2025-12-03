"use client";

import { ReactNode } from "react";

import { Button } from "../ui/button";

interface AuthFormProps {
  children: ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  submitText: string;
  submitIcon?: ReactNode;
  className?: string;
}

export function AuthForm({ 
  children, 
  onSubmit, 
  loading = false, 
  submitText, 
  submitIcon,
  className = ""
}: AuthFormProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-4 sm:space-y-6 ${className}`}>
      <div className="space-y-3 sm:space-y-4">
        {children}
      </div>

      <Button
        type="submit"
        disabled={loading}
        size="lg"
        className="w-full bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
            Processando...
          </div>
        ) : (
          <>
            {submitIcon}
            {submitText}
          </>
        )}
      </Button>
    </form>
  );
}
