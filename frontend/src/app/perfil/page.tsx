"use client";

import { useState } from "react";
import PageHeader from "../../components/PageHeader";
import { useProfile } from "../../hooks/useProfile";
import {
  ProfileHeader,
  ProfileTabs,
  ProfileForm,
  ChangePasswordForm,
  ProfileError,
  ErrorToast
} from "../../components/profile";
import PageLoading from "../../components/PageLoading";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  
  const {
    user,
    loading,
    saving,
    changingPassword,
    error,
    success: _success,
    isLoadingRole,
    loadData,
    saveProfile,
    changePassword,
    clearError
  } = useProfile();

  if (loading || isLoadingRole) {
    return (
      <PageLoading 
        message="Carregando perfil..." 
        description="Preparando suas informações pessoais" 
      />
    );
  }

  if (!user) {
    return <ProfileError onRetry={loadData} />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <PageHeader
        title="Meu Perfil"
        description="Gerencie suas informações pessoais e configurações"
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        }
        iconColor="purple"
      />

      <ProfileTabs 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={user} 
      />

      {activeTab === 'profile' && (
        <div className="space-y-6">
          <ProfileHeader user={user} />
          <ProfileForm 
            user={user}
            onSave={saveProfile}
            saving={saving}
          />
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <ChangePasswordForm 
            user={user}
            onChangePassword={changePassword}
            changingPassword={changingPassword}
          />
        </div>
      )}

      <ErrorToast error={error} onClose={clearError} />
    </div>
  );
}
