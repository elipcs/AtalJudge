import React from "react";
import { Invite } from "@/types";
import { Button } from "../ui/button";
import { createBrazilianDate, formatDate, translateUserRole } from "@/utils";
import InviteConfirmModal from "./InviteConfirmModal";

interface InviteItemProps {
  invite: Invite;
  copied: string | null;
  onCopyLink: (link: string, id: string) => void;
  onDelete: (invite: Invite) => void;
  onRevoke: (invite: Invite) => void;
}

export function InviteItem({ invite, copied, onCopyLink, onDelete, onRevoke }: InviteItemProps) {
  const now = new Date();
  const expiresAt = createBrazilianDate(invite.expiresAt);
  const isActive = !invite.used && expiresAt && now < expiresAt;
  const isExpired = expiresAt && now >= expiresAt;
  const isUsed = invite.used;

  const inviteeDisplay = invite.className || invite.classId || translateUserRole(invite.role);

  const [modalOpen, setModalOpen] = React.useState<null | "delete" | "revoke">(null);
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (modalOpen === "delete") {
        await onDelete(invite);
      } else if (modalOpen === "revoke") {
        await onRevoke(invite);
      }
      setModalOpen(null);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    if (role === 'student') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      );
    } else if (role === 'assistant') {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    }
  };

  const getStatusIcon = () => {
    if (isActive) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else if (isUsed) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    } else {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
  };

  return (
    <div 
      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
        isActive 
          ? 'border-green-200 bg-green-50 hover:border-green-300 hover:bg-green-100' 
          : isUsed
          ? 'border-red-200 bg-red-50 hover:border-red-300 hover:bg-red-100'
          : 'border-yellow-200 bg-yellow-50 hover:border-yellow-300 hover:bg-yellow-100'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3">
            {}
            <div className={`p-2 rounded-lg border ${
              invite.role === 'student' 
                ? 'border-blue-500 bg-blue-50' 
                : invite.role === 'assistant'
                ? 'border-green-500 bg-green-50'
                : 'border-purple-500 bg-purple-50'
            }`}>
              <div className={`${
                invite.role === 'student' 
                  ? 'text-blue-600' 
                  : invite.role === 'assistant'
                  ? 'text-green-600'
                  : 'text-purple-600'
              }`}>
                {getRoleIcon(invite.role)}
              </div>
            </div>

            {}
            <div className={`p-2 rounded-lg border ${
              isActive 
                ? 'border-green-500 bg-green-50' 
                : isUsed
                ? 'border-red-500 bg-red-50'
                : 'border-yellow-500 bg-yellow-50'
            }`}>
              <div className={`${
                isActive 
                  ? 'text-green-600' 
                  : isUsed
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}>
                {getStatusIcon()}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {}
            <div>
              <div className="text-sm font-medium text-gray-900">{translateUserRole(invite.role)}</div>
              <div className={`text-xs font-medium ${
                isActive 
                  ? 'text-green-700' 
                  : isUsed
                  ? 'text-red-700'
                  : 'text-yellow-700'
              }`}>
                {isActive ? 'Ativo' : isUsed ? 'Usado' : 'Expirado'}
              </div>
            </div>
            
            {}
            <div>
              <div className="text-sm font-medium text-gray-900">
                {invite.currentUses || 0}/{invite.maxUses} usos
              </div>
              <div className="text-xs text-gray-500">Limite</div>
            </div>

            {}
            {invite.classId && (
              <div>
                <div className="text-sm font-medium text-indigo-600">
                  {invite.className || invite.classId}
                </div>
                <div className="text-xs text-gray-500">Turma</div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Criado</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(invite.createdAt)}
              </div>
            </div>
            
            <div>
              <div className="text-xs text-gray-500">Expira</div>
              <div className="text-sm font-medium text-gray-900">
                {formatDate(invite.expiresAt)}
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-2">
            {}
            {isActive && (
              <Button
                onClick={() => onCopyLink(invite.link, invite.id)}
                className={`w-full px-6 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  copied === invite.id 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {copied === invite.id ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copiado
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copiar
                  </>
                )}
              </Button>
            )}
            
            {}
            <Button
              variant="outline"
              onClick={() => setModalOpen(isExpired || isUsed ? "delete" : "revoke")}
              className={`w-full px-6 py-2.5 text-xs font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 ${
                (isExpired || isUsed) 
                  ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                  : 'border-red-200 text-red-700 hover:bg-red-50'
              }`}
              aria-label={isExpired || isUsed ? "Excluir convite" : "Revogar convite"}
            >
              {isExpired || isUsed ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Excluir
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="red" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Revogar
                </>
              )}
            </Button>
            <InviteConfirmModal
              isOpen={!!modalOpen}
              onCancel={() => setModalOpen(null)}
              onConfirm={handleConfirm}
              type={modalOpen === "delete" ? "delete" : "revoke"}
              invitee={inviteeDisplay}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center gap-2 mb-1">
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          <span className="text-xs font-medium text-gray-700">Link do Convite</span>
        </div>
        <div className="bg-white p-2 rounded border text-xs font-mono break-all text-gray-700">
          {invite.link}
        </div>
      </div>
    </div>
  );
}
