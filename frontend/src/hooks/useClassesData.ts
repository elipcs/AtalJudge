import { useState, useEffect, useCallback, useMemo } from 'react';

import { Class, Student } from '../types';
import { classesApi } from '../services/classes';

export const useUserClasses = (userId: string, userRole: string, userClassId?: string) => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isValidParams = useMemo(() => {
    return userId && userId.trim() !== '' && userRole;
  }, [userId, userRole]);

  const fetchClasses = useCallback(async () => {
    if (!isValidParams) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await classesApi.getUserClasses(userId, userRole, true, userClassId);
      setClasses(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar turmas');
    } finally {
      setLoading(false);
    }
  }, [userId, userRole, userClassId, isValidParams]);

  useEffect(() => {
    if (isValidParams) {
      fetchClasses();
    } else {
      setLoading(true);
      setError(null);
    }
  }, [fetchClasses, isValidParams]);

  return { classes, loading, error, refetch: fetchClasses };
};

export const useCreateClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createClass = async (data: {
    name: string;
    professorId: string;
    professorName: string;
  }): Promise<Class | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await classesApi.create(data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar turma');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createClass, loading, error };
};

export const useEditClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editClass = async (id: string, data: { name: string }): Promise<Class | null> => {
    try {
      setLoading(true);
      setError(null);
      const result = await classesApi.update(id, data);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao editar turma');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { editClass, loading, error };
};

export const useDeleteClass = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteClass = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const result = await classesApi.delete(id);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir turma');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { deleteClass, loading, error };
};

export const useClassStudents = (classId: string) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await classesApi.getClassStudents(classId);
        const mappedStudents: Student[] = result.map((s: any) => ({
          id: s.id,
          name: s.name,
          email: s.email,
          studentRegistration: s.studentRegistration || '',
          role: s.role,
          classId: classId,
          grades: s.grades || [],
          createdAt: s.createdAt || new Date().toISOString(),
        }));
        setStudents(mappedStudents);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar alunos');
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    if (classId && classId.trim() !== '') {
      fetchStudents();
    } else {
      setLoading(false);
      setStudents([]);
    }
  }, [classId]);

  return { students, loading, error };
};

