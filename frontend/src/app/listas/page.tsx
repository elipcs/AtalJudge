"use client";

import { useState, useMemo, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import PageHeader from "@/components/PageHeader";
import { 
  CreateListModal, 
  EditListModal, 
  ListsFilters, 
  ListsGrid,
  ListsError
} from "@/components/lists";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";
import { useUserRole } from "@/hooks/useUserRole";
import { useCurrentUser } from "@/hooks/useHomeData";
import { useListsData } from "@/hooks/useListsData";
import { useListsActions } from "@/hooks/useListsActions";
import PageLoading from "@/components/PageLoading";

import { QuestionList } from "@/types";

export default function ListsPage() {
  const [search, setSearch] = useState('');
  const [serverSearch, setServerSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [localLists, setLocalLists] = useState<QuestionList[]>([]);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialLoad = useRef(true);
  
  const { userRole } = useUserRole();
  const { data: currentUser } = useCurrentUser();
  const { 
    lists, 
    classes, 
    loading, 
    error, 
    refreshLists, 
    createList, 
    updateList, 
    deleteList, 
    setFilters,
    clearFilters
  } = useListsData(userRole, currentUser);

  const {
    showCreateModal,
    showEditModal,
    showDeleteModal,
    editingList,
    deletingList,
    handleCreateList: baseHandleCreateList,
    handleEditList: baseHandleEditList,
    handleDeleteList: baseHandleDeleteList,
    handleEditClick,
    handleDeleteClick,
    setShowCreateModal,
    closeCreateModal,
    closeEditModal,
    closeDeleteModal
  } = useListsActions({
    createList,
    updateList,
    deleteList
  });

  const handleCreateList = async (listData: any) => {
    await baseHandleCreateList(listData);
    setSearch('');
    setServerSearch('');
    await refreshLists();
  };

  const handleEditList = async (listData: any) => {
    await baseHandleEditList(listData);
    await refreshLists();
  };

  const handleDeleteList = async () => {
    await baseHandleDeleteList();
    await refreshLists();
  };

  useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    setIsSearching(true);
    searchTimeout.current = setTimeout(() => {
      setServerSearch(search);
      setIsSearching(false);
    }, 500);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [search]);

  useEffect(() => {
    const filters = {
      search: serverSearch || undefined
    };
    setFilters(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverSearch]);

  useEffect(() => {
    setLocalLists(lists);
  }, [lists]);

  const filteredLists = useMemo(() => {
    if (!search) return localLists;
    
    return localLists.filter(list => {
      if (!list || !list.id) {
        return false;
      }
      
      const searchLower = search.toLowerCase();
      return list.title.toLowerCase().includes(searchLower) ||
             (list.description?.toLowerCase() || '').includes(searchLower);
    });
  }, [localLists, search]);

  if ((loading && localLists.length === 0) || isInitialLoad.current) {
    return <PageLoading message="Carregando listas..." description="Preparando as listas de exercícios" />;
  }

  if (error) {
    return (
      <ListsError 
        error={error}
        onRetry={() => window.location.reload()}
        onRefresh={() => window.location.reload()}
      />
    );
  }

  const handleClearFilters = () => {
    setSearch('');
    setServerSearch('');
    clearFilters();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <PageHeader
        title="Listas de Exercícios"
        description="Gerencie e visualize todas as listas de exercícios"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        }
        iconColor="slate"
      >
        {userRole !== 'student' && (
          <Button
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nova Lista
          </Button>
        )}
      </PageHeader>

  {}

      {}
      <ListsFilters
        search={search}
        userRole={userRole}
        onSearchChange={setSearch}
        onClearFilters={handleClearFilters}
        isSearching={isSearching}
      />

      {}
      <ListsGrid
        lists={filteredLists}
        userRole={userRole}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onCreateList={() => setShowCreateModal(true)}
        classes={classes}
      />

      {}
      <CreateListModal
        isOpen={showCreateModal}
        onClose={closeCreateModal}
        onSubmit={handleCreateList}
        classes={classes.map(cls => ({ id: cls.id, name: cls.name }))}
      />

      <EditListModal
        isOpen={showEditModal}
        onClose={closeEditModal}
        onSubmit={handleEditList}
        onRefresh={refreshLists}
        classes={classes.map(cls => ({ id: cls.id, name: cls.name }))}
        listData={editingList ? {
          id: editingList.id,
          title: editingList.title,
          description: editingList.description || '',
          startDate: editingList.startDate,
          endDate: editingList.endDate,
          classIds: editingList.classIds || [],
          countTowardScore: editingList.countTowardScore ?? false,
          isRestricted: editingList.isRestricted ?? false,
          calculatedStatus: editingList.calculatedStatus
        } : undefined}
      />

      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteList}
        title="Confirmar Exclusão"
        message={`Tem certeza que deseja excluir a lista "${deletingList?.title}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
