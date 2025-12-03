"use client";

interface QuestionTabsProps {
  labels: string[];
  activeIndex: number;
  onSelect: (index: number) => void;
  userRole?: string;
}

export default function QuestionTabs({ labels, activeIndex, onSelect, userRole = 'student' }: QuestionTabsProps) {
  const base = "px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200";
  const activeRoleClass =
    userRole === 'professor'
      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
      : userRole === 'student'
      ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200'
      : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200';

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-2 mb-6">
      <nav
        className="flex flex-wrap gap-2"
        role="tablist"
        aria-label="Navegação de questões"
      >
        {labels.map((label, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={`${label}-${idx}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tab-panel-${idx}`}
              className={
                isActive
                  ? `${base} shadow-sm border ${activeRoleClass}`
                  : `${base} text-slate-600 hover:text-slate-900 hover:bg-slate-50`
              }
              onClick={() => onSelect(idx)}
            >
              {label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
