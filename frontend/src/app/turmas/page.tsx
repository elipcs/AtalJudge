"use client";

import React from "react";

import { useClassPage } from "@/hooks/useClassPage";
import { CreateClassModal, EditClassModal, DeleteClassModal, ClassDetails, ClassesList, ClassesError } from "@/components/classes";
import PageHeader from "@/components/PageHeader";
import PageLoading from "@/components/PageLoading";
import { Button } from "@/components/ui/button";

export default function TurmasPage() {
  const {
    userRole,
    currentUser: _currentUser,
    classes,
    classDetails,    
    error,
    success,
    showDetails,
    createClassModal,
    editClassModal,
    deleteClassModal,
    selectedClass,
    isLoading,
    isStudentLoading,
    studentsLoading,
    createLoading,
    editLoading,
    deleteLoading,
    classesError,
    handleCreateClass,
    handleViewClassDetails,
    handleBackToList,
    handleEditClass,
    handleDeleteClass,
    handleOpenEditModal,
    handleOpenDeleteModal,
    setCreateClassModal,
    setEditClassModal,
    setDeleteClassModal,
    setError: _setError,
    setSuccess: _setSuccess
  } = useClassPage();

  if (isLoading || isStudentLoading) {
    return <PageLoading message="Carregando suas turmas..." description="Preparando as informações das turmas" />;
  }

  if (classesError) {
    return (
      <ClassesError 
        error={classesError}
        onRetry={() => window.location.reload()}
        onGoToInvites={() => window.location.href = '/convites'}
        onGoToHome={() => window.location.href = '/home'}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      {showDetails && classDetails ? (
        <PageHeader
          title={classDetails.cls.name}
          description={`Prof. ${classDetails.cls.professor?.name || 'Desconhecido'}`}
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconColor="indigo"
        >
          {userRole !== 'student' && (
            <Button 
              variant="outline" 
              onClick={handleBackToList} 
              className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Voltar às Turmas
            </Button>
          )}
        </PageHeader>
      ) : (
        <PageHeader
          title={userRole === 'student' ? 'Minha Turma' : 'Minhas Turmas'}
          description={userRole === 'student' 
            ? 'Informações da sua turma' 
            : 'Escolha uma turma para ver os detalhes'
          }
          icon={
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
          iconColor="indigo"
        >
          {userRole === 'professor' && (
            <Button
              variant="outline"
              onClick={() => setCreateClassModal(true)}
              className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nova Turma
            </Button>
          )}
        </PageHeader>
      )}

      {}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl shadow-sm mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">{success}</span>
          </div>
        </div>
      )}

      {showDetails && classDetails ? (
        <ClassDetails
          classDetails={classDetails}
          userRole={userRole || 'student'}
          currentUserId={_currentUser?.id}
          onBack={handleBackToList}
          onEditClass={handleOpenEditModal}
          onDeleteClass={handleOpenDeleteModal}
          loading={studentsLoading}
        />
      ) : (
        <ClassesList
          classes={classes}
          userRole={userRole || 'student'}
          onViewDetails={handleViewClassDetails}
          onEditClass={handleOpenEditModal}
          onDeleteClass={handleOpenDeleteModal}
          loading={studentsLoading}
        />
      )}

      {}
      <CreateClassModal
        isOpen={createClassModal}
        onClose={() => setCreateClassModal(false)}
        onCreateClass={handleCreateClass}
        loading={createLoading}
        error={error}
        success={success}
      />

      {}
      <EditClassModal
        isOpen={editClassModal}
        onClose={() => setEditClassModal(false)}
        onEditClass={handleEditClass}
        classData={selectedClass}
        loading={editLoading}
        error={error}
      />

      {}
      <DeleteClassModal
        isOpen={deleteClassModal}
        onClose={() => setDeleteClassModal(false)}
        onDeleteClass={handleDeleteClass}
        classData={selectedClass}
        loading={deleteLoading}
        error={error}
      />

    </div>
  );
}
