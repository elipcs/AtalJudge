"use client";

import { useState, useEffect, useCallback } from "react";
import { API } from "../config/api";
import { classesApi } from "../services/classes";

interface SystemReset {
  resetSubmissions: boolean;
  resetStudents: boolean;
  resetClasses: boolean;
  resetLists: boolean;
  resetMonitors: boolean;
  resetProfessors: boolean;
  resetInvites: boolean;
  resetAllowedIPs: boolean;
  confirmationText: string;
}

interface AllowedIP {
  id: string;
  ip: string;
  description: string;
  active: boolean;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration?: string;
  classId?: string;
  className?: string;
  submissionsCount?: number;
}

export function useSettings() {
  const [activeTab, setActiveTab] = useState('reset');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [buttonSuccess, setButtonSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [systemReset, setSystemReset] = useState<SystemReset>({
    resetSubmissions: false,
    resetStudents: false,
    resetClasses: false,
    resetLists: false,
    resetMonitors: false,
    resetProfessors: false,
    resetInvites: false,
    resetAllowedIPs: false,
    confirmationText: ''
  });

  const [allowedIPs, setAllowedIPs] = useState<AllowedIP[]>([]);
  const [newIP, setNewIP] = useState({ ip: '', description: '' });

  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadAllowedIPs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.config.getAllowedIps();
      const payload = response.data as { allowedIPs?: AllowedIP[] } | AllowedIP[];
      const list = Array.isArray(payload) ? payload : (payload.allowedIPs ?? []);
      setAllowedIPs(list);
    } catch (_error) {
      setError('Erro ao carregar IPs permitidos');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.config.getStudents();
      let list = Array.isArray(response.data) ? response.data : [];
      
      try {
        const classes = await classesApi.getAll(true);
        
        const studentClassMap = new Map<string, { classId: string; className: string }>();
        classes.forEach(cls => {
          if (cls.students && Array.isArray(cls.students)) {
            cls.students.forEach(student => {
              studentClassMap.set(student.id, {
                classId: cls.id,
                className: cls.name
              });
            });
          }
        });
        
        list = list.map(student => ({
          ...student,
          classId: student.classId || studentClassMap.get(student.id)?.classId,
          className: student.className || studentClassMap.get(student.id)?.className
        }));
      } catch (enrichError) {
      }
      
      setStudents(list);
    } catch (_error) {
      setError('Erro ao carregar estudantes');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (activeTab === 'ips') {
      await loadAllowedIPs();
    } else if (activeTab === 'students') {
      await loadStudents();
    }
  }, [activeTab, loadAllowedIPs, loadStudents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const performSystemReset = useCallback(async () => {
    if (systemReset.confirmationText !== 'RESETAR') {
      setError('Digite "RESETAR" para confirmar a operação');
      return;
    }

    try {
      setSaving(true);
      setButtonSuccess(false);
      
      await API.config.systemReset({
        resetSubmissions: systemReset.resetSubmissions,
        resetStudents: systemReset.resetStudents,
        resetClasses: systemReset.resetClasses,
        resetLists: systemReset.resetLists,
        resetMonitors: systemReset.resetMonitors,
        resetProfessors: systemReset.resetProfessors,
        resetInvites: systemReset.resetInvites,
        resetAllowedIPs: systemReset.resetAllowedIPs,
      });

      setButtonSuccess(true);
      setSuccess('Reset do sistema realizado com sucesso!');
      setSystemReset({
        resetSubmissions: false,
        resetStudents: false,
        resetClasses: false,
        resetLists: false,
        resetMonitors: false,
        resetProfessors: false,
        resetInvites: false,
        resetAllowedIPs: false,
        confirmationText: ''
      });
      
      setTimeout(() => setButtonSuccess(false), 3000);
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Erro ao realizar reset');
    } finally {
      setSaving(false);
    }
  }, [systemReset]);

  const addAllowedIP = useCallback(async () => {
    if (!newIP.ip || !newIP.description) {
      setError('Preencha o IP e a descrição');
      return;
    }

    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(newIP.ip)) {
      setError('Formato de IP inválido');
      return;
    }

    try {
      setSaving(true);
      await API.config.createAllowedIp(newIP);
      setSuccess('IP adicionado com sucesso!');
      setNewIP({ ip: '', description: '' });
      await loadAllowedIPs();
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Erro ao adicionar IP');
    } finally {
      setSaving(false);
    }
  }, [newIP, loadAllowedIPs]);

  const toggleIP = useCallback(async (id: string) => {
    try {
      await API.config.toggleAllowedIp(id);
      await loadAllowedIPs();
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Erro ao alterar status');
    }
  }, [loadAllowedIPs]);

  const removeIP = useCallback(async (id: string) => {
    try {
      await API.config.deleteAllowedIp(id);
      setSuccess('IP removido com sucesso!');
      await loadAllowedIPs();
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Erro ao remover IP');
    }
  }, [loadAllowedIPs]);

  const removeSelectedStudents = useCallback(async () => {
    if (selectedStudents.length === 0) {
      setError('Selecione pelo menos um estudante');
      return;
    }

    try {
      setSaving(true);
      setButtonSuccess(false);
      
      await API.config.removeStudents(selectedStudents);

      setButtonSuccess(true);
      setSuccess(`${selectedStudents.length} estudante(s) removido(s) com sucesso!`);
      setSelectedStudents([]);
      await loadStudents();
      
      setTimeout(() => setButtonSuccess(false), 3000);
    } catch (_error) {
      setError(_error instanceof Error ? _error.message : 'Erro ao remover estudantes');
    } finally {
      setSaving(false);
    }
  }, [selectedStudents, loadStudents]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(null), []);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.studentRegistration?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.className?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const setSystemResetField = useCallback((field: keyof SystemReset, value: boolean | string) => {
    setSystemReset(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setAllSystemReset = useCallback((checked: boolean) => {
    setSystemReset(prev => ({
      ...prev,
      resetSubmissions: checked,
      resetStudents: checked,
      resetClasses: checked,
      resetLists: checked,
      resetMonitors: checked,
      resetProfessors: checked,
      resetInvites: checked,
      resetAllowedIPs: checked,
    }));
  }, []);

  const clearAllSystemReset = useCallback(() => {
    setSystemReset(prev => ({
      ...prev,
      resetSubmissions: false,
      resetStudents: false,
      resetClasses: false,
      resetLists: false,
      resetMonitors: false,
      resetProfessors: false,
      resetInvites: false,
      resetAllowedIPs: false,
    }));
  }, []);

  const toggleStudentSelection = useCallback((studentId: string) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  }, []);

  return {
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
    loadAllowedIPs,
    loadStudents,
    performSystemReset,
    addAllowedIP,
    toggleIP,
    removeIP,
    removeSelectedStudents,
    clearError,
    clearSuccess,
    filteredStudents,
    toggleStudentSelection,
  };
}
