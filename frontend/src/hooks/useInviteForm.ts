import { useState, useEffect } from "react";
import { classesApi } from "../services/classes";

export interface InviteFormData {
  role: 'student' | 'assistant' | 'professor';
  classId: string;
  maxUses: number;
  expirationDays: number;
}

export function useInviteForm() {
  const [formData, setFormData] = useState<InviteFormData>({
    role: 'student',
    classId: '',
    maxUses: 1,
    expirationDays: 7,
  });
  
  const [availableClasses, setAvailableClasses] = useState<{id: string; name: string}[]>([]);
  const [classesLoading, setClassesLoading] = useState(true);
  const [classesError, setClassesError] = useState<string | null>(null);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);
  const [isExpirationDropdownOpen, setIsExpirationDropdownOpen] = useState(false);

  const loadClasses = async () => {
    try {
      setClassesLoading(true);
      setClassesError(null);
      const classes = await classesApi.getAll();
      const safeClasses = Array.isArray(classes) ? classes : [];
      const formattedClasses = safeClasses.map(cls => ({
        id: cls.id,
        name: cls.name
      }));
      setAvailableClasses(formattedClasses);
    } catch (error) {
      setClassesError(error instanceof Error ? error.message : 'Erro ao carregar turmas');
      setAvailableClasses([]);
    } finally {
      setClassesLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.class-dropdown-container')) {
        setIsClassDropdownOpen(false);
      }
      if (!target.closest('.expiration-dropdown-container')) {
        setIsExpirationDropdownOpen(false);
      }
    };

    if (isClassDropdownOpen || isExpirationDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isClassDropdownOpen, isExpirationDropdownOpen]);

  const updateFormData = (updates: Partial<InviteFormData>) => {
    setFormData(prev => {
      const newData = { ...prev, ...updates };
      
      if (updates.role && updates.role !== 'student') {
        newData.classId = '';
      }
      
      return newData;
    });
  };

  const resetForm = () => {
    setFormData({
      role: 'student',
      classId: '',
      maxUses: 1,
      expirationDays: 7,
    });
  };

  const validateForm = (): string | null => {
    if (formData.role === 'student') {
      if (!formData.classId) {
        return 'Selecione uma turma para convites de aluno';
      }
      if (availableClasses.length === 0) {
        return 'Você precisa criar pelo menos uma turma ativa antes de gerar convites para alunos';
      }
    }
    return null;
  };

  return {
    formData,
    availableClasses,
    classesLoading,
    classesError,
    isClassDropdownOpen,
    isExpirationDropdownOpen,
    updateFormData,
    resetForm,
    validateForm,
    setIsClassDropdownOpen,
    setIsExpirationDropdownOpen,
    loadClasses,
  };
}
