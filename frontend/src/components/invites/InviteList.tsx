"use client";

import { Invite } from "@/types";
import { Card } from "../ui/card";
import { InviteItem } from "./InviteItem";

interface InviteListProps {
  invites: Invite[];
  loading: boolean;
  error: string | null;
  copied: string | null;
  onCopyLink: (link: string, id: string) => void;
  onDelete: (invite: Invite) => void;
  onRevoke: (invite: Invite) => void;
  onReload: () => void;
}

export function InviteList({ 
  invites, 
  loading, 
  error, 
  copied, 
  onCopyLink, 
  onDelete, 
  onRevoke, 
  onReload 
}: InviteListProps) {

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Carregando convites...</h3>
          <p className="text-gray-500">Aguarde enquanto buscamos seus convites.</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="mb-4">
            <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 text-red-600 rounded-xl shadow-lg border border-red-200 mx-auto w-fit">
              <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar convites</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={onReload}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02] py-2 px-4 rounded-xl"
          >
            Tentar Novamente
          </button>
        </div>
      </Card>
    );
  }

  if (invites.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convite criado</h3>
          <p className="text-gray-500">Crie seu primeiro convite usando o formulário acima.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Convites Criados</h2>
      </div>
      
      <div className="space-y-3">
        {invites.map(invite => (
          <InviteItem
            key={invite.id}
            invite={invite}
            copied={copied}
            onCopyLink={onCopyLink}
            onDelete={onDelete}
            onRevoke={onRevoke}
          />
        ))}
      </div>
    </Card>
  );
}
