import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BackendStatus } from "@/components/BackendStatus";
import ListsDiagnostic from "./ListsDiagnostic";

interface ListsErrorProps {
  error: string;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function ListsError({ error, onRetry, onRefresh }: ListsErrorProps) {
  const isConnectionError = error.includes('Failed to fetch') || 
                           error.includes('HTTP 500') || 
                           error.includes('Internal Server Error') ||
                           error.includes('Não foi possível conectar');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <Card className="bg-white border-red-200 rounded-3xl shadow-lg p-8 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="p-4 bg-gradient-to-r from-red-50 to-red-100 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto mb-6 w-fit">
            <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-red-900 mb-4">
            Erro ao Carregar Listas
          </h2>
          
          <p className="text-red-700 text-lg leading-relaxed mb-6">
            {isConnectionError 
              ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando."
              : "Ocorreu um erro inesperado ao carregar as listas de exercícios."
            }
          </p>

          {isConnectionError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-red-800 mb-2">Status da Conexão:</h3>
              <BackendStatus showDetails={true} />
            </div>
          )}

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">Detalhes do Erro:</h3>
            <p className="text-sm text-gray-600 font-mono break-all">
              {error}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={onRetry}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Tentar Novamente
            </Button>
            
            <Button 
              onClick={onRefresh}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold transition-all duration-200 rounded-xl"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Recarregar Página
            </Button>
          </div>

          {isConnectionError && (
            <div className="mt-6 space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Soluções Sugeridas:</h3>
                <ul className="text-sm text-blue-700 text-left space-y-1">
                  <li>• Verifique se o servidor backend está rodando</li>
                  <li>• Confirme se a URL do backend está correta</li>
                  <li>• Verifique se não há problemas de firewall</li>
                  <li>• Tente reiniciar o servidor backend</li>
                </ul>
              </div>
              
              <ListsDiagnostic />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
