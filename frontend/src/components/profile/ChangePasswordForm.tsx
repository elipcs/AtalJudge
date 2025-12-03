"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { PasswordValidation } from "../auth";
import { ProfileData, ChangePasswordData } from "../../services/profile";

interface ChangePasswordFormProps {
  user: ProfileData;
  onChangePassword: (changePasswordData: ChangePasswordData) => Promise<void>;
  changingPassword: boolean;
}

export default function ChangePasswordForm({ 
  user, 
  onChangePassword, 
  changingPassword
}: ChangePasswordFormProps) {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  const handleChangePassword = async () => {
    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      return;
    }

    if (!formData.currentPassword || !formData.newPassword) {
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return;
    }

    const isPasswordValid = validatePassword(formData.newPassword);
    if (!isPasswordValid.minLength) {
      return;
    }
    if (!isPasswordValid.hasLetters) {
      return;
    }
    if (!isPasswordValid.hasNumbers) {
      return;
    }
    if (!isPasswordValid.hasUppercase) {
      return;
    }
    if (!isPasswordValid.hasLowercase) {
      return;
    }
    if (!isPasswordValid.hasSpecialChar) {
      return;
    }

    const changePasswordData: ChangePasswordData = {
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      userId: user?.id
    };

    await onChangePassword(changePasswordData);
    
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const isFormValid = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return false;
    }

    if (formData.currentPassword === formData.newPassword) {
      return false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return false;
    }

    const isPasswordValid = validatePassword(formData.newPassword);
    return isPasswordValid.minLength && isPasswordValid.hasLetters && 
           isPasswordValid.hasNumbers && isPasswordValid.hasUppercase &&
           isPasswordValid.hasLowercase && isPasswordValid.hasSpecialChar;
  };

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-8">
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-3 rounded-xl border ${
          user.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-600 border-purple-200' :
          user.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 border-blue-200' :
          'bg-gradient-to-r from-green-50 to-green-100 text-green-600 border-green-200'
        }`}>
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <div>
          <h4 className="text-2xl font-bold text-slate-900">Alterar Senha</h4>
          <p className="text-slate-600">Mantenha sua conta segura com uma senha forte</p>
        </div>
      </div>

      <div className="space-y-6 max-w-4xl">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
          <label className="block text-sm font-semibold text-slate-900 mb-3">Senha Atual</label>
          <Input
            type="password"
            value={formData.currentPassword}
            onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
            placeholder="Digite sua senha atual"
            className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Nova Senha</label>
            <Input
              type="password"
              value={formData.newPassword}
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              placeholder="Digite sua nova senha"
              className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
            />
            <PasswordValidation password={formData.newPassword} minLength={8} />
          </div>
          
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Confirmar Nova Senha</label>
            <Input
              type="password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirme sua nova senha"
              className="h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
            />
          </div>
        </div>

        <Button 
          onClick={handleChangePassword}
          disabled={changingPassword || !isFormValid()}
          className={`w-full shadow-sm hover:shadow-md font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none py-3 rounded-xl ${
            user.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200' :
            user.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' :
            'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200'
          }`}
        >
          {changingPassword ? (
            <>
              <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2 ${
                user.role === 'professor' ? 'border-purple-600' :
                user.role === 'student' ? 'border-blue-600' :
                'border-green-600'
              }`}></div>
              Alterando...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Alterar Senha
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
