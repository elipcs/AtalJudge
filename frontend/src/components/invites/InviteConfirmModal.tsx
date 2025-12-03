import React from "react";

interface InviteConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  type: "revoke" | "delete";
  invitee: string;
  loading?: boolean;
}

export default function InviteConfirmModal({
  isOpen,
  onConfirm,
  onCancel,
  type,
  invitee,
  loading = false,
}: InviteConfirmModalProps) {
  if (!isOpen) return null;
  
  const isDelete = type === "delete";
  
  const handleConfirm = () => {
    if (!loading) {
      onConfirm();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className={`flex items-center justify-between p-6 border-b border-slate-200 rounded-t-2xl ${
          isDelete 
            ? 'bg-gradient-to-r from-red-50 to-orange-50' 
            : 'bg-gradient-to-r from-yellow-50 to-orange-50'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl shadow-lg ${
              isDelete 
                ? 'bg-gradient-to-br from-red-500 to-orange-600' 
                : 'bg-gradient-to-br from-yellow-500 to-orange-600'
            }`}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isDelete ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {isDelete ? "Excluir Convite" : "Revogar Convite"}
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">Confirme sua ação</p>
            </div>
          </div>
          {!loading && (
            <button
              onClick={onCancel}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div className="text-center">
              <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {isDelete ? "Confirmar exclusão" : "Confirmar revogação"}
                </h3>
                <p className="text-sm text-slate-700 mb-2">
                  Tem certeza que deseja {isDelete ? "excluir" : "revogar"} o convite para <strong className="text-slate-900">{invitee}</strong>?
                </p>
                <p className={`text-sm font-medium mt-2 ${
                  isDelete ? 'text-red-600' : 'text-yellow-700'
                }`}>
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                  isDelete 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 focus:ring-red-500' 
                    : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    {isDelete ? "Excluindo..." : "Revogando..."}
                  </span>
                ) : (
                  isDelete ? "Sim, Excluir" : "Sim, Revogar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
