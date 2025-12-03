"use client";

import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import { InviteList, FilterDropdown, CreateInviteModal } from "../../components/invites";
import { Button } from "../../components/ui/button";
import { useUserRole } from "../../hooks/useUserRole";
import { useInvites } from "../../hooks/useInvites";
import { useInviteFilters } from "../../hooks/useInviteFilters";
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

export default function InvitesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { userRole, isLoading } = useUserRole();
  const { filterRole, filterStatus, updateRoleFilter, updateStatusFilter } = useInviteFilters();
  const { 
    invites, 
    loading: invitesLoading, 
    error: invitesError, 
    copied, 
    loadInvites, 
    copyLink, 
    deleteInvite, 
    revokeInvite 
  } = useInvites();
  const { toast } = useToast();

  useEffect(() => {
    loadInvites(filterRole, filterStatus);
  }, [filterRole, filterStatus, loadInvites]);

  useEffect(() => {
    if (!isLoading && userRole !== 'professor') {
      window.location.href = '/nao-autorizado';
    }
  }, [isLoading, userRole]);

  if (!isLoading && userRole !== 'professor') {
    return null;
  }

  const handleInviteCreated = () => {
    loadInvites(filterRole, filterStatus);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <PageHeader
        title="Convites"
        description="Crie e gerencie links de convite para novos usuários"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
          </svg>
        }
        iconColor="blue"
      >
        <Button
          variant="outline"
          onClick={() => setShowCreateModal(true)}
          className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Criar Convite
        </Button>
      </PageHeader>

      <div className="space-y-6">

        <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FilterDropdown
              label="Tipo de Usuário"
              value={filterRole}
              options={[
                { value: 'all', label: 'Todos os tipos' },
                { value: 'student', label: 'Alunos' },
                { value: 'assistant', label: 'Monitores' },
                { value: 'professor', label: 'Professores' }
              ]}
              onChange={updateRoleFilter}
            />
            
            <FilterDropdown
              label="Status"
              value={filterStatus}
              options={[
                { value: 'all', label: 'Todos os status' },
                { value: 'active', label: 'Ativos' },
                { value: 'used', label: 'Usados' },
                { value: 'expired', label: 'Expirados' }
              ]}
              onChange={updateStatusFilter}
            />
          </div>
        </div>

        <InviteList
          invites={invites}
          loading={invitesLoading}
          error={invitesError}
          copied={copied}
          onCopyLink={copyLink}
          onDelete={async (invite) => {
            try {
              await deleteInvite(invite.id);
              await loadInvites(filterRole, filterStatus);
              toast({
                description: "Convite excluído com sucesso!",
                variant: "success",
              });
            } catch (e) {
              toast({
                title: "Erro",
                description: "Erro ao excluir convite",
                variant: "destructive",
              });
            }
          }}
          onRevoke={async (invite) => {
            try {
              await revokeInvite(invite.id);
              toast({
                description: "Convite revogado com sucesso!",
                variant: "success",
              });
            } catch (e) {
              toast({
                title: "Erro",
                description: "Erro ao revogar convite",
                variant: "destructive",
              });
            }
          }}
          onReload={() => loadInvites(filterRole, filterStatus)}
        />
      </div>

      <CreateInviteModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onInviteCreated={handleInviteCreated}
      />
    </div>
  );
}
