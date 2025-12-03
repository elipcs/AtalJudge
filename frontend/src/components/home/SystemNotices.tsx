"use client";

import React from "react";

import { useSystemNotices } from "../../hooks/useHomeData";
import { formatDate, EmptyState, SystemError } from "../../utils";

export default function SystemNotices() {
  const { data: notices, error } = useSystemNotices();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Avisos do Sistema
        </h3>
      </div>

      {error ? (
        <SystemError message={error} />
      ) : (
        <div className="space-y-3 max-h-80 overflow-y-auto">
          {(notices || []).length === 0 ? (
            <EmptyState 
              title="Nenhum aviso encontrado"
              message="Não há avisos disponíveis no momento."
            />
          ) : (
            (notices || []).map(notice => (
              <div
                key={notice.id}
                className={`p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${
                  notice.type === 'warning' ? 'bg-amber-50 border-amber-400 text-amber-900' :
                  notice.type === 'success' ? 'bg-emerald-50 border-emerald-400 text-emerald-900' :
                  notice.type === 'error' ? 'bg-red-50 border-red-400 text-red-900' :
                  'bg-blue-50 border-blue-400 text-blue-900'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{notice.title}</h4>
                  <span className="text-xs opacity-70">
                    {formatDate(notice.date)}
                  </span>
                </div>
                <p className="text-sm opacity-90">{notice.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
