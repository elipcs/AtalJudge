"use client";

import Link from "next/link";

interface ListTabsProps {
  id: string;
  activeTab: "lista" | "questoes";
  hasQuestions: boolean;
  userRole?: string;
}

export default function ListTabs({ id, activeTab, hasQuestions, userRole: _userRole = 'student' }: ListTabsProps) {
  const activeBase = "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm border";
  const inactiveBase = "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50";
  const disabledBase = "px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 text-slate-400 cursor-not-allowed";

  const activeRoleClass = 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200';

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-2 mb-6">
      <nav className="flex space-x-2">
        {activeTab === 'lista' ? (
          <span className={`${activeBase} ${activeRoleClass}`}>Lista</span>
        ) : (
          <Link href={`/listas/detalhes?id=${id}`} className={inactiveBase}>Lista</Link>
        )}

        {activeTab === 'questoes' ? (
          <span className={`${activeBase} ${activeRoleClass}`}>Questões</span>
        ) : hasQuestions ? (
          <Link href={`/listas/questoes?id=${id}`} className={inactiveBase}>Questões</Link>
        ) : (
          <span aria-disabled className={disabledBase}>Questões</span>
        )}
      </nav>
    </div>
  );
}
