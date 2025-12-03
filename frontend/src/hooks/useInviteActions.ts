import { useState } from "react";
import { Invite } from "@/types";
import { invitesApi } from "../services/invites";

export function useInviteActions() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [inviteToDelete, setInviteToDelete] = useState<Invite | null>(null);
  const [inviteToRevoke, setInviteToRevoke] = useState<Invite | null>(null);

  const showDeleteConfirmation = (invite: Invite) => {
    setInviteToDelete(invite);
    setShowDeleteModal(true);
  };

  const showRevokeConfirmation = (invite: Invite) => {
    setInviteToRevoke(invite);
    setShowRevokeModal(true);
  };

  const confirmDelete = async (onSuccess?: () => void) => {
    if (!inviteToDelete) return;

    const scrollPosition = window.scrollY;

    try {
      const success = await invitesApi.delete(inviteToDelete.id);
      if (success) {
        onSuccess?.();
        
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
    } finally {
      setInviteToDelete(null);
    }
  };

  const confirmRevoke = async (onSuccess?: () => void) => {
    if (!inviteToRevoke) return;

    const scrollPosition = window.scrollY;

    try {
      const success = await invitesApi.revoke(inviteToRevoke.id);
      if (success) {
        onSuccess?.();
        
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 0);
      }
    } catch (error) {
    } finally {
      setInviteToRevoke(null);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setInviteToDelete(null);
  };

  const closeRevokeModal = () => {
    setShowRevokeModal(false);
    setInviteToRevoke(null);
  };

  return {
    showDeleteModal,
    showRevokeModal,
    inviteToDelete,
    inviteToRevoke,
    showDeleteConfirmation,
    showRevokeConfirmation,
    confirmDelete,
    confirmRevoke,
    closeDeleteModal,
    closeRevokeModal,
  };
}
