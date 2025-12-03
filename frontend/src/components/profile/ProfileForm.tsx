"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { ProfileData, UpdateProfileData } from "../../services/profile";

interface ProfileFormProps {
  user: ProfileData;
  onSave: (updateData: UpdateProfileData) => Promise<void>;
  saving: boolean;
}

export default function ProfileForm({ user, onSave, saving }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    name: user.name || '',
    studentRegistration: user.studentRegistration || ''
  });

  const handleSave = async () => {
    if (!formData.name || formData.name.trim().length === 0) {
      return;
    }

    if (formData.name.trim().length < 2) {
      return;
    }

    if (user.role === 'student') {
      if (!formData.studentRegistration || formData.studentRegistration.trim().length === 0) {
        return;
      }
      
      const registrationDigits = formData.studentRegistration.replace(/\D/g, '');
      if (registrationDigits.length !== 9 && registrationDigits.length !== 11) {
        return;
      }
    }

    const updateData: UpdateProfileData = {
      name: formData.name,
      studentRegistration: formData.studentRegistration
    };

    await onSave(updateData);
  };

  const isFormValid = () => {
    if (!formData.name || formData.name.trim().length < 2) {
      return false;
    }

    if (user.role === 'student') {
      if (!formData.studentRegistration || formData.studentRegistration.trim().length === 0) {
        return false;
      }
      
      const registrationDigits = formData.studentRegistration.replace(/\D/g, '');
      if (registrationDigits.length !== 9 && registrationDigits.length !== 11) {
        return false;
      }
    }

    return true;
  };

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6">
      <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 rounded-xl border border-purple-200">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </div>
        Editar Informações
      </h3>
      
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Nome Completo <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={`h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl ${!formData.name || formData.name.trim().length < 2 ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
              placeholder="Digite seu nome completo"
            />
            {(!formData.name || formData.name.trim().length < 2) && (
              <p className="text-xs text-red-500 mt-2">Nome é obrigatório (mínimo 2 caracteres)</p>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">Email</label>
            <Input
              value={user.email}
              disabled
              className="h-12 bg-slate-100 text-slate-500 rounded-xl"
            />
            <p className="text-xs text-slate-500 mt-2">O email não pode ser alterado</p>
          </div>
        </div>

        {user.role === 'student' && (
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6">
            <label className="block text-sm font-semibold text-slate-900 mb-3">
              Matrícula <span className="text-red-500">*</span>
            </label>
            <Input
              value={formData.studentRegistration}
              onChange={e => setFormData({ ...formData, studentRegistration: e.target.value })}
              placeholder="Digite sua matrícula (9 ou 11 dígitos)"
              className={`h-12 bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl ${
                !formData.studentRegistration || 
                formData.studentRegistration.trim().length === 0 ||
                (formData.studentRegistration.replace(/\D/g, '').length !== 9 && formData.studentRegistration.replace(/\D/g, '').length !== 11)
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                  : ''
              }`}
            />
            {(!formData.studentRegistration || 
              formData.studentRegistration.trim().length === 0 ||
              (formData.studentRegistration.replace(/\D/g, '').length !== 9 && formData.studentRegistration.replace(/\D/g, '').length !== 11)) && (
              <p className="text-xs text-red-500 mt-2">Matrícula deve ter exatamente 9 ou 11 dígitos</p>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={saving || !isFormValid()}
            className={`shadow-sm hover:shadow-md font-semibold transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none px-8 py-3 rounded-xl ${
              user.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 border border-purple-200' :
              user.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200' :
              'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200'
            }`}
          >
            {saving ? (
              <>
                <div className={`animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2 ${
                  user.role === 'professor' ? 'border-purple-600' :
                  user.role === 'student' ? 'border-blue-600' :
                  'border-green-600'
                }`}></div>
                Salvando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
