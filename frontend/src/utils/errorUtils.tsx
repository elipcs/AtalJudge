import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message?: string;
  className?: string;
}

export function ErrorMessage({ 
  title = "Erro ao carregar dados", 
  message = "Dados não encontrados",
  className = ""
}: ErrorMessageProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}

export function InlineError({ 
  message = "Erro ao carregar dados",
  className = ""
}: { message?: string; className?: string }) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <p className="text-red-600">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ 
  title = "Nenhum item encontrado",
  message = "Não há itens disponíveis no momento.",
  icon,
  action,
  className = ""
}: EmptyStateProps) {
  const defaultIcon = (
    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-gray-500">
        {icon || defaultIcon}
        <p className="text-lg font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-sm text-gray-500">{message}</p>
        {action && (
          <div className="mt-4">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}

export function SystemError({ message }: { message: string }) {
  return (
    <div className="text-center py-8">
      <p className="text-red-600">Erro ao carregar avisos: {message}</p>
    </div>
  );
}

export function handleApiError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'Ocorreu um erro inesperado';
}

