import { useState, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DiagnosticResult {
  endpoint: string;
  status: 'success' | 'error' | 'loading';
  response?: unknown;
  error?: string;
}

export default function ListsDiagnostic() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const endpoints = useMemo(() => ([
    { name: 'Health Check', url: '/health' },
    { name: 'Classes API', url: '/api/classes' },
    { name: 'Lists API', url: '/api/lists' },
    { name: 'User Profile', url: '/api/users/profile' },
  ]), []);

  const runDiagnostics = useCallback(async () => {
    setLoading(true);
    setDiagnostics([]);

    const results: DiagnosticResult[] = [];

    for (const endpoint of endpoints) {
      results.push({ endpoint: endpoint.name, status: 'loading' });
      setDiagnostics([...results]);

      try {
        const response = await fetch(endpoint.url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(endpoint.url.includes('/api/') && {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            })
          },
        });

        if (response.ok) {
          const data = await response.json();
          results[results.length - 1] = {
            endpoint: endpoint.name,
            status: 'success',
            response: data as unknown
          };
        } else {
          results[results.length - 1] = {
            endpoint: endpoint.name,
            status: 'error',
            error: `HTTP ${response.status}: ${response.statusText}`
          };
        }
      } catch (error) {
        results[results.length - 1] = {
          endpoint: endpoint.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        };
      }

      setDiagnostics([...results]);
    }

    setLoading(false);
  }, [endpoints]);

  useEffect(() => {
    setTimeout(() => {
      runDiagnostics();
    }, 0);
  }, [runDiagnostics]);

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Diagnóstico da API</h3>
        <Button
          onClick={runDiagnostics}
          disabled={loading}
          size="sm"
          variant="outline"
          className="text-sm border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
        >
          {loading ? 'Testando...' : 'Executar Testes'}
        </Button>
      </div>

      <div className="space-y-3">
        {diagnostics.map((diagnostic, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
            <span className="font-medium text-slate-900">{diagnostic.endpoint}</span>
            <div className="flex items-center gap-2">
              {diagnostic.status === 'loading' && (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              )}
              {diagnostic.status === 'success' && (
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              )}
              {diagnostic.status === 'error' && (
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              )}
              
              <span className={`text-sm font-medium ${
                diagnostic.status === 'success' ? 'text-green-600' :
                diagnostic.status === 'error' ? 'text-red-600' :
                'text-yellow-600'
              }`}>
                {diagnostic.status === 'loading' ? 'Testando...' :
                 diagnostic.status === 'success' ? 'OK' :
                 diagnostic.status === 'error' ? 'Erro' : ''}
              </span>
            </div>
          </div>
        ))}
      </div>

      {diagnostics.some(d => d.status === 'error') && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <h4 className="text-sm font-semibold text-red-800 mb-2">Problemas Encontrados:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {diagnostics
              .filter(d => d.status === 'error')
              .map((diagnostic, index) => (
                <li key={index}>
                  • <strong>{diagnostic.endpoint}:</strong> {diagnostic.error}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Informações do Sistema:</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <div>• URL Base: {((typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) || 'http://localhost:3333/api').replace(/\/api$/, '')}</div>
          <div>• Token: {localStorage.getItem('token') ? 'Presente' : 'Ausente'}</div>
          <div>• Ambiente: {(typeof process !== 'undefined' && process.env.NODE_ENV) || 'development'}</div>
        </div>
      </div>
    </Card>
  );
}
