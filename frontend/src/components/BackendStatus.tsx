'use client';

import { useState, useEffect } from 'react';

import { checkBackendHealth } from '../utils/backendHealthCheck';

interface BackendStatusProps {
  showDetails?: boolean;
}

interface BackendStatusDetails {
  status?: number;
  statusText?: string;
  url?: string;
  contentType?: string;
  timeout?: string;
  suggestion?: string;
  error?: unknown;
  [key: string]: unknown;
}

export function BackendStatus({ showDetails = false }: BackendStatusProps) {
  const [status, setStatus] = useState<{
    isHealthy: boolean;
    error?: string;
    details?: BackendStatusDetails;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      setLoading(true);
      const result = await checkBackendHealth();
      setStatus(result);
      setLoading(false);
    };

    checkStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
        Verificando conexão com o backend...
      </div>
    );
  }

  if (!status) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
        Erro ao verificar status
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${
        status.isHealthy ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      <span className={status.isHealthy ? 'text-green-600' : 'text-red-600'}>
        {status.isHealthy ? 'Backend conectado' : 'Backend desconectado'}
      </span>

      {!status.isHealthy && status.error && (
        <span className="text-red-500 text-xs">
          - {status.error}
        </span>
      )}

      {showDetails && status.details && (
        <details className="text-xs text-gray-500 ml-2">
          <summary className="cursor-pointer">Detalhes</summary>
          <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-auto">
            {JSON.stringify(status.details, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
