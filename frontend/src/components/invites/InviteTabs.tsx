"use client";

interface InviteTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function InviteTabs({ activeTab, setActiveTab }: InviteTabsProps) {
  const tabs = [
    { id: 'generate', label: 'Gerar Convite' },
    { id: 'manage', label: 'Gerenciar Convites' }
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 mb-6">
      <nav className="flex space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200 shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
