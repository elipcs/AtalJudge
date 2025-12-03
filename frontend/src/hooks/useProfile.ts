"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUserRole } from "./useUserRole";
import { profileApi, ProfileData, UpdateProfileData, ChangePasswordData } from "../services/profile";
import { useToast } from "./use-toast";

export function useProfile() {
  const router = useRouter();
  const { userRole, isLoading: isLoadingRole } = useUserRole();
  const { toast } = useToast();
  
  const [user, setUser] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
  const profileData = await profileApi.getProfile();
  setUser(profileData);
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor.');
      } else {
        setError('Erro ao carregar dados do perfil. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  const saveProfile = useCallback(async (updateData: UpdateProfileData) => {
    if (!user) {
      return;
    }

    if (!updateData.name || updateData.name.trim().length === 0) {
      setError('O nome é obrigatório');
      return;
    }

    if (updateData.name.trim().length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      return;
    }

    if (user.role === 'student') {
      if (!updateData.studentRegistration || updateData.studentRegistration.trim().length === 0) {
        setError('A matrícula é obrigatória para estudantes');
        return;
      }
      
      const registrationDigits = updateData.studentRegistration.replace(/\D/g, '');
      if (registrationDigits.length !== 9 && registrationDigits.length !== 11) {
        setError('A matrícula deve ter exatamente 9 ou 11 dígitos');
        return;
      }
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');
      
  const updatedProfile = await profileApi.updateProfile(updateData);
  setUser(updatedProfile);
      
      toast({
        description: "Perfil atualizado com sucesso!",
        variant: "success",
      });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor. Verifique se o backend está rodando em http://localhost:3333');
      } else {
        setError(error instanceof Error ? error.message : 'Erro ao salvar perfil. Tente novamente.');
      }
    } finally {
      setSaving(false);
    }
  }, [user, router]);

  const changePassword = useCallback(async (changePasswordData: ChangePasswordData) => {
    if (changePasswordData.currentPassword && changePasswordData.newPassword && 
        changePasswordData.currentPassword === changePasswordData.newPassword) {
      setError('A nova senha não pode ser igual à senha atual');
      return;
    }

    if (!changePasswordData.currentPassword || !changePasswordData.newPassword) {
      setError('Preencha todos os campos de senha');
      return;
    }

    const isPasswordValid = validatePassword(changePasswordData.newPassword);
    if (!isPasswordValid.minLength) {
      setError("Senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (!isPasswordValid.hasLetters) {
      setError("Senha deve conter letras");
      return;
    }
    if (!isPasswordValid.hasNumbers) {
      setError("Senha deve conter números");
      return;
    }
    if (!isPasswordValid.hasUppercase) {
      setError("Senha deve conter pelo menos 1 letra maiúscula");
      return;
    }
    if (!isPasswordValid.hasLowercase) {
      setError("Senha deve conter pelo menos 1 letra minúscula");
      return;
    }
    if (!isPasswordValid.hasSpecialChar) {
      setError("Senha deve conter pelo menos 1 caractere especial");
      return;
    }

    try {
      setChangingPassword(true);
      setError('');
      setSuccess('');
      
      await profileApi.changePassword(changePasswordData);

      toast({
        description: "Senha alterada com sucesso!",
        variant: "success",
      });
    } catch (error) {
      if (error instanceof Error && (error.message.includes('Não autorizado') || error.message.includes('Token expirado'))) {
        router.push('/login');
        return;
      }
      
      if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('fetch')
      )) {
        setError('Erro de conexão: Não foi possível conectar ao servidor.');
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Erro ao alterar senha';
        setError(errorMessage);
      }
    } finally {
      setChangingPassword(false);
    }
  }, [router]);

  function validatePassword(password: string) {
    return {
      minLength: password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  }

  const clearError = useCallback(() => {
    setError('');
  }, []);

  useEffect(() => {
    document.title = "Meu Perfil | AtalJudge";
  }, []);

  useEffect(() => {
    if (!isLoadingRole && userRole) {
      loadData();
    }
  }, [userRole, isLoadingRole, loadData]);

  return {
    user,
    loading,
    saving,
    changingPassword,
    error,
    success,
    isLoadingRole,
    loadData,
    saveProfile,
    changePassword,
    clearError,
    validatePassword
  };
}
