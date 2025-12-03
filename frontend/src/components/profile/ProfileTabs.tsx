"use client";

import { ProfileData } from "../../services/profile";

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: ProfileData;
}

export default function ProfileTabs({ activeTab, setActiveTab, user }: ProfileTabsProps) {
  const tabs = [
    { id: 'profile', label: 'Informações Pessoais' },
    { id: 'security', label: 'Segurança' }
  ];

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-2 mb-6">
      <nav className="flex space-x-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
              activeTab === tab.id
                ? `shadow-sm border ${
                    user.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border-purple-200' :
                    user.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' :
                    'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200'
                  }`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
