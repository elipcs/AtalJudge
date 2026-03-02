import { useState, useEffect } from 'react';
import { useUserRole } from './useUserRole';
import { useCurrentUser } from './useHomeData';
import { useUserClasses, useCreateClass, useEditClass, useDeleteClass, useClassStudents } from './useClassesData';
import { Class, Student } from '@/types';
import { classesApi } from '@/services/classes';

export function useClassPage() {
  const { userRole, isLoading: userRoleLoading } = useUserRole();
  const { data: currentUser } = useCurrentUser();

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [classDetails, setClassDetails] = useState<{ cls: Class; students: Student[] } | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [createClassModal, setCreateClassModal] = useState(false);
  const [editClassModal, setEditClassModal] = useState(false);
  const [deleteClassModal, setDeleteClassModal] = useState(false);
  const [transferClassModal, setTransferClassModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const { classes, loading: classesLoading, error: classesError, refetch: refetchClasses } = useUserClasses(
    currentUser?.id || '',
    userRole || 'student',
    (currentUser as any)?.classId
  );
  const { createClass, loading: createLoading, error: createError } = useCreateClass();
  const { editClass, loading: editLoading, error: _editError } = useEditClass();
  const { deleteClass, loading: deleteLoading, error: _deleteError } = useDeleteClass();
  const [transferLoading, setTransferLoading] = useState(false);
  const { students, loading: studentsLoading } = useClassStudents(selectedClassId || '');

  useEffect(() => {
    if (userRole === 'student' && classes.length > 0 && !selectedClassId) {
      const id = setTimeout(() => setSelectedClassId(classes[0].id), 0);
      return () => clearTimeout(id);
    }
  }, [userRole, classes.length, selectedClassId]);

  const isStudentDataReady = userRole === 'student' && classes.length > 0 && selectedClassId && !studentsLoading;

  useEffect(() => {
    if (userRole === 'student' && selectedClassId && !studentsLoading && classes.length > 0) {
      const classData = classes.find(cls => cls.id === selectedClassId);
      if (classData) {
        const studentsToUse = (classData.students || []).length > 0 ? (classData.students || []) : students;
        const id = setTimeout(() => {
          setClassDetails({
            cls: classData,
            students: studentsToUse
          });
          setShowDetails(true);
        }, 0);
        return () => clearTimeout(id);
      }
    }
  }, [userRole, selectedClassId, studentsLoading, classes.length, students.length]);

  useEffect(() => {
    if ((userRole === 'professor' || userRole === 'assistant') && selectedClassId && !studentsLoading && classes.length > 0) {
      const classData = classes.find(cls => cls.id === selectedClassId);
      if (classData) {
        // Prioritize 'students' from useClassStudents hook as it usually has more detailed data (grades)
        // compared to classData.students which might come from a list view
        const studentsToUse = (students && students.length > 0) ? students : (classData.students || []);

        const id = setTimeout(() => {
          setClassDetails({
            cls: classData,
            students: studentsToUse
          });
        }, 0);
        return () => clearTimeout(id);
      }
    }
  }, [userRole, selectedClassId, studentsLoading, classes.length, students]);

  const handleCreateClass = async (nameClass: string) => {
    if (!nameClass.trim()) {
      setError('Nome da turma é obrigatório');
      return;
    }

    setError("");
    setSuccess("");

    try {
      const newClass = await createClass({
        name: nameClass.trim(),
        professorId: currentUser?.id ?? '',
        professorName: currentUser?.name ?? ''
      });

      if (newClass) {
        setSuccess('Turma criada com sucesso!');
        setCreateClassModal(false);
        refetchClasses();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(createError || 'Erro ao criar turma');
      }
    } catch (error: unknown) {
      setError((error as Error).message || 'Erro ao criar turma');
    }
  };

  const handleViewClassDetails = (cls: Class) => {
    setSelectedClassId(cls.id);
    setShowDetails(true);
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setClassDetails(null);
    setSelectedClassId(null);
  };

  const isLoading = userRoleLoading || classesLoading || (!currentUser && (userRole === 'professor' || userRole === 'assistant'));
  const isStudentLoading = userRole === 'student' && !isStudentDataReady;

  const handleEditClass = async (id: string, data: { name: string }): Promise<boolean> => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem editar turmas");
      return false;
    }

    try {
      setError("");
      const result = await editClass(id, data);

      if (result) {
        setSuccess("Turma editada com sucesso!");
        setEditClassModal(false);
        setSelectedClass(null);
        refetchClasses();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao editar turma");
      return false;
    }
  };

  const handleDeleteClass = async (id: string): Promise<boolean> => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem excluir turmas");
      return false;
    }

    try {
      setError("");
      const result = await deleteClass(id);

      if (result) {
        setSuccess("Turma excluída com sucesso!");
        setDeleteClassModal(false);
        setSelectedClass(null);
        refetchClasses();
        return true;
      }
      return false;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir turma");
      return false;
    }
  };

  const handleTransferClass = async (classId: string, newProfessorId: string): Promise<boolean> => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem transferir turmas");
      return false;
    }

    setTransferLoading(true);
    try {
      setError("");
      await classesApi.transfer(classId, newProfessorId);
      setSuccess("Turma transferida com sucesso!");
      setTransferClassModal(false);
      setSelectedClass(null);
      refetchClasses();
      if (showDetails) {
        setShowDetails(false);
        setClassDetails(null);
        setSelectedClassId(null);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao transferir turma");
      return false;
    } finally {
      setTransferLoading(false);
    }
  };

  const handleOpenEditModal = (cls: Class) => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem editar turmas");
      return;
    }

    setSelectedClass(cls);
    setEditClassModal(true);
    setError("");
  };

  const handleOpenDeleteModal = (cls: Class) => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem excluir turmas");
      return;
    }

    setSelectedClass(cls);
    setDeleteClassModal(true);
    setError("");
  };

  const handleOpenTransferModal = (cls: Class) => {
    if (userRole !== 'professor') {
      setError("Apenas professores podem transferir turmas");
      return;
    }

    setSelectedClass(cls);
    setTransferClassModal(true);
    setError("");
  };

  return {
    userRole,
    currentUser,
    classes,
    classDetails,
    students,
    error,
    success,
    showDetails,
    createClassModal,
    editClassModal,
    deleteClassModal,
    transferClassModal,
    selectedClass,
    selectedClassId,
    isLoading,
    isStudentLoading,
    studentsLoading,
    createLoading,
    editLoading,
    deleteLoading,
    transferLoading,
    classesError,
    handleCreateClass,
    handleViewClassDetails,
    handleBackToList,
    handleEditClass,
    handleDeleteClass,
    handleTransferClass,
    handleOpenEditModal,
    handleOpenDeleteModal,
    handleOpenTransferModal,
    setCreateClassModal,
    setEditClassModal,
    setDeleteClassModal,
    setTransferClassModal,
    setError,
    setSuccess
  };
}
