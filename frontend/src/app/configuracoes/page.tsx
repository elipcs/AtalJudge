"use client";

import PageHeader from "../../components/PageHeader";
import { useUserRole } from "../../hooks/useUserRole";
import PageLoading from "../../components/PageLoading";
import {
  ConfiguracoesTabs,
  ResetSystemTab,
  AllowedIPsTab,
  ManageStudentsTab,
  ConfiguracoesError,
  ConfiguracoesSuccess
} from "../../components/configuracoes";
import { useSettings } from "../../hooks/useSettings";
import ManageStudentClassModal from "../../components/configuracoes/ManageStudentClassModal";
import { useState, useEffect } from "react";
import { classesApi } from "../../services/classes";
import { Class } from "@/types";
import { API } from "../../config/api";

export default function ConfiguracoesPage() {
  const { userRole, isLoading: userRoleLoading } = useUserRole();
  const {
    activeTab,
    setActiveTab,
    loading,
    saving,
    buttonSuccess,
    error,
    success,
    systemReset,
    setSystemResetField,
    setAllSystemReset,
    clearAllSystemReset,
    allowedIPs,
    newIP,
    setNewIP,
    students,
    selectedStudents,
    searchTerm,
    setSearchTerm,
    performSystemReset,
    addAllowedIP,
    toggleIP,
    removeIP,
    removeSelectedStudents,
    clearError,
    clearSuccess,
    filteredStudents,
    toggleStudentSelection,
    loadStudents,
  } = useSettings();

  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string; email: string; studentRegistration?: string; classId?: string; className?: string } | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoadingClasses(true);
        const allClasses = await classesApi.getAll(true);
        setClasses(allClasses);
      } catch (error) {
      } finally {
        setLoadingClasses(false);
      }
    };

    if (activeTab === 'students') {
      fetchClasses();
    }
  }, [activeTab]);

  const handleManageClass = (student: { id: string; name: string; email: string; studentRegistration?: string; classId?: string; className?: string }) => {
    setSelectedStudent(student);
    setShowClassModal(true);
  };

  const handleSaveStudentClass = async (studentId: string, classId: string | null) => {
    try {
      if (selectedStudent?.classId) {
        await API.classes.removeStudent(selectedStudent.classId, studentId);
      }
      
      if (classId) {
        await API.classes.addStudent(classId, studentId);
      }
      
      await loadStudents();
      setShowClassModal(false);
      setSelectedStudent(null);
    } catch (error) {
      throw error;
    }
  };

  if (userRoleLoading) {
    return (
      <PageLoading 
        message="Carregando configurações..." 
        description="Preparando as configurações do sistema" 
      />
    );
  }

  if (userRole !== 'professor') {
    if (typeof window !== 'undefined') {
      window.location.href = '/nao-autorizado';
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <PageHeader
        title="Configurações do Sistema"
        description="Gerencie configurações avançadas do AtalJudge"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
        iconColor="gray"
      />

      <ConfiguracoesTabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />

      {activeTab === 'reset' && (
        <ResetSystemTab
          systemReset={systemReset}
          saving={saving}
          buttonSuccess={buttonSuccess}
          onFieldChange={setSystemResetField}
          onSelectAll={() => setAllSystemReset(true)}
          onClearAll={() => clearAllSystemReset()}
          onExecuteReset={performSystemReset}
        />
      )}

      {activeTab === 'ips' && (
        <AllowedIPsTab
          allowedIPs={allowedIPs}
          newIP={newIP}
          saving={saving}
          loading={loading}
          onNewIPChange={(field, value) => setNewIP(prev => ({ ...prev, [field]: value }))}
          onAddIP={addAllowedIP}
          onToggleIP={toggleIP}
          onRemoveIP={removeIP}
        />
      )}

      {activeTab === 'students' && (
        <>
          <ManageStudentsTab
            students={students}
            filteredStudents={filteredStudents}
            selectedStudents={selectedStudents}
            searchTerm={searchTerm}
            saving={saving}
            loading={loading}
            buttonSuccess={buttonSuccess}
            onSearchChange={setSearchTerm}
            onStudentToggle={toggleStudentSelection}
            onRemoveSelected={removeSelectedStudents}
            onManageClass={handleManageClass}
          />
          
          <ManageStudentClassModal
            isOpen={showClassModal}
            student={selectedStudent}
            classes={classes}
            onClose={() => {
              setShowClassModal(false);
              setSelectedStudent(null);
            }}
            onSave={handleSaveStudentClass}
          />
        </>
      )}

      <ConfiguracoesError error={error} onClose={clearError} />
      <ConfiguracoesSuccess success={success} onClose={clearSuccess} />
    </div>
  );
}
