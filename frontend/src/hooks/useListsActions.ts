import { useState } from "react";
import { QuestionList } from "@/types";
import { createBrazilianDate } from "@/utils";
import { listsApi } from "@/services/lists";
import { useToast } from "./use-toast";

interface UseListsActionsProps {
  createList: (listData: any) => Promise<any>;
  updateList: (id: string, listData: any) => Promise<any>;
  deleteList: (id: string) => Promise<any>;
}

export function useListsActions({
  createList,
  updateList,
  deleteList
}: UseListsActionsProps) {
  const { toast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingList, setEditingList] = useState<QuestionList | null>(null);
  const [deletingList, setDeletingList] = useState<QuestionList | null>(null);

  const handleCreateList = async (listData: any) => {
    try {
      await createList(listData);
      toast({
        description: "Lista criada com sucesso!",
        variant: "success",
      });
      setShowCreateModal(false);
    } catch (error) {
      throw error;
    }
  };

  const handleEditList = async (listData: any) => {
    try {
      if (!editingList) return;
      
      await updateList(editingList.id, listData);
      toast({
        description: "Lista atualizada com sucesso!",
        variant: "success",
      });
      setShowEditModal(false);
      setEditingList(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteList = async () => {
    try {
      if (!deletingList) return;
      
      await deleteList(deletingList.id);
      toast({
        description: "Lista deletada com sucesso!",
        variant: "success",
      });
      setShowDeleteModal(false);
      setDeletingList(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEditClick = (list: QuestionList) => {
    setEditingList(list);
    setShowEditModal(true);
  };

  const handleDeleteClick = (list: QuestionList) => {
    setDeletingList(list);
    setShowDeleteModal(true);
  };

  const closeCreateModal = () => setShowCreateModal(false);
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingList(null);
  };
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletingList(null);
  };

  return {
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingList,
    deletingList,
    handleCreateList,
    handleEditList,
    handleDeleteList,
    handleEditClick,
    handleDeleteClick,
    setShowCreateModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal
  };
}
