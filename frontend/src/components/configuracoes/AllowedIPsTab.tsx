import { Button } from "../../components/ui/button";

interface AllowedIP {
  id: string;
  ip: string;
  description: string;
  active: boolean;
  createdAt: string;
}

interface AllowedIPsTabProps {
  allowedIPs: AllowedIP[];
  newIP: { ip: string; description: string };
  saving: boolean;
  loading: boolean;
  onNewIPChange: (field: 'ip' | 'description', value: string) => void;
  onAddIP: () => void;
  onToggleIP: (id: string) => void;
  onRemoveIP: (id: string) => void;
}

export default function AllowedIPsTab({
  allowedIPs,
  newIP,
  saving,
  loading,
  onNewIPChange,
  onAddIP,
  onToggleIP,
  onRemoveIP,
}: AllowedIPsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Adicionar Novo IP
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Endereço IP
            </label>
            <input
              type="text"
              value={newIP.ip}
              onChange={e => onNewIPChange('ip', e.target.value)}
              className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              placeholder="192.168.1.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={newIP.description}
              onChange={e => onNewIPChange('description', e.target.value)}
              className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
              placeholder="Laboratório da universidade"
            />
          </div>
        </div>

        <Button
          onClick={onAddIP}
          disabled={saving}
          variant="secondary"
          size="lg"
          className={`gap-3 ${!saving ? 'bg-slate-800 hover:bg-slate-700 text-white' : ''}`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Adicionando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="white" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Adicionar IP
            </>
          )}
        </Button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6">IPs Cadastrados</h3>
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando IPs...</p>
          </div>
        ) : allowedIPs.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-slate-600">Nenhum IP cadastrado ainda</p>
          </div>
        ) : (
          <div className="space-y-3">
            {allowedIPs.map(ip => (
              <div key={ip.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-semibold text-slate-900">{ip.ip}</span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                      ip.active 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {ip.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{ip.description}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Adicionado em {new Date(ip.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => onToggleIP(ip.id)}
                    variant={ip.active ? "outline" : "default"}
                    size="sm"
                    className="text-xs"
                  >
                    {ip.active ? 'Desativar' : 'Ativar'}
                  </Button>
                  
                  <Button
                    onClick={() => onRemoveIP(ip.id)}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
