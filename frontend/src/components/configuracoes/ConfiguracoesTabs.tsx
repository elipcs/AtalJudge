interface ConfiguracoesTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export default function ConfiguracoesTabs({ activeTab, onTabChange }: ConfiguracoesTabsProps) {
  const tabs = [
    { id: 'reset', label: 'Reset do Sistema' },
    { id: 'ips', label: 'IPs Permitidos' },
    { id: 'students', label: 'Gerenciar Estudantes' }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-2 mb-6">
      <nav className="flex space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-slate-200 to-slate-100 text-slate-900 border border-slate-300 shadow-sm'
                : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
