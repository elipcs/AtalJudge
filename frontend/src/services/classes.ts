import { API } from '../config/api';
import { logger } from '../utils/logger';
import { ClassResponseDTO } from '@/types/dtos';
import { Class, Professor } from '@/types';

function mapClassDTO(dto: ClassResponseDTO): Class {
  const professor: Professor | null = dto.professor
    ? {
        id: dto.professor.id,
        name: dto.professor.name,
        email: dto.professor.email,
        role: dto.professor.role,
      }
    : dto.professorName
    ? {
        id: dto.professorId,
        name: dto.professorName,
        email: '',
        role: 'professor',
      }
    : null;

  const students = Array.isArray(dto.students)
    ? dto.students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        studentRegistration: s.studentRegistration || '',
        role: s.role,
        classId: dto.id,
        grades: [],
        createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(s.createdAt).toISOString(),
      }))
    : [];

  return {
    id: dto.id,
    name: dto.name,
    professor,
    students,
    studentCount: typeof dto.studentCount === 'number' ? dto.studentCount : students.length,
    createdAt: typeof dto.createdAt === 'string' ? dto.createdAt : new Date(dto.createdAt).toISOString(),
    updatedAt: typeof dto.updatedAt === 'string' ? dto.updatedAt : new Date(dto.updatedAt).toISOString(),
  };
}

export const classesApi = {
  async getAll(includeRelations: boolean = false): Promise<Class[]> {
    try {
      const params = includeRelations ? { include: 'relations' as string } : undefined;
      const response = await API.classes.list(params);
      const { data } = response;
      
      if (!data) {
        return [];
      }
      
      const array = Array.isArray(data) ? data : [];
      
      return array.map(mapClassDTO);
    } catch (error) {
      throw error;
    }
  },

  async getById(id: string): Promise<Class | null> {
    try {

      const { data } = await API.classes.get(id, true);
      if (!data) return null;
      
      const studentsResponse = await API.classes.students(id);
      
      const studentsWithGrades = Array.isArray(studentsResponse.data.students)
        ? studentsResponse.data.students.map((s: any) => {
            const mapped = {
              id: s.id,
              name: s.name,
              email: s.email,
              studentRegistration: s.studentRegistration || '',
              role: s.role,
              classId: id,
              grades: s.grades || [],
              createdAt: typeof s.createdAt === 'string' ? s.createdAt : new Date(s.createdAt).toISOString(),
            };
            return mapped;
          })
        : [];
      
      const professor: Professor | null = data.professor
        ? {
            id: data.professor.id,
            name: data.professor.name,
            email: data.professor.email,
            role: data.professor.role,
          }
        : data.professorName
        ? {
            id: data.professorId,
            name: data.professorName,
            email: '',
            role: 'professor',
          }
        : null;

      return {
        id: data.id,
        name: data.name,
        professor,
        students: studentsWithGrades,
        studentCount: studentsWithGrades.length,
        createdAt: typeof data.createdAt === 'string' ? data.createdAt : new Date(data.createdAt).toISOString(),
        updatedAt: typeof data.updatedAt === 'string' ? data.updatedAt : new Date(data.updatedAt).toISOString(),
      };
    } catch (error) {
      return null;
    }
  },

    async getUserClasses(
    userId: string,
    userRole: string,
    includeRelations: boolean = true,
    userClassId?: string
  ): Promise<Class[]> {
    try {
      if (userRole === 'student' && userClassId) {
        try {
          const classData = await this.getById(userClassId);
          if (classData) {
            return [classData];
          }
        } catch (err) {
        }
      }
      
      const params = includeRelations ? { include: 'relations' } : undefined;
      const allClasses = await API.classes.list(params);
      const array = Array.isArray(allClasses.data) ? allClasses.data : [];
      
      if (userRole === 'student') {
        const mappedClasses = array.map(mapClassDTO);
        
        let studentClasses = mappedClasses.filter((cls: Class) => {
          if (Array.isArray(cls.students) && cls.students.length > 0) {
            return cls.students.some(student => student.id === userId);
          }
          if (userClassId && cls.id === userClassId) {
            return true;
          }
          return false;
        });
        
        if (studentClasses.length === 0 && userClassId) {
          const classById = mappedClasses.find(cls => cls.id === userClassId);
          if (classById) {
            studentClasses = [classById];
          }
        }
        
        if (studentClasses.length === 0) {
          const classesToFetch = array.filter((clsData: ClassResponseDTO) => {
            return !Array.isArray(clsData.students) || clsData.students.length === 0;
          });
          
          const fetchedClasses = await Promise.all(
            classesToFetch.map(async (clsData: ClassResponseDTO) => {
              try {
                const fullClassData = await this.getById(clsData.id);
                if (fullClassData && Array.isArray(fullClassData.students)) {
                  const hasStudent = fullClassData.students.some(student => student.id === userId);
                  return hasStudent ? fullClassData : null;
                }
                return null;
              } catch (err) {
                return null;
              }
            })
          );
          
          const validClasses = fetchedClasses.filter((cls): cls is Class => cls !== null);
          if (validClasses.length > 0) {
            return validClasses;
          }
        }
        
        if (studentClasses.length > 0) {
          return studentClasses;
        }
        
        return [];
      }
      
      const mappedClasses = array.map(mapClassDTO);
      
      return mappedClasses;
    } catch (error) {
      throw error;
    }
  },

  async create(data: { name: string; professorId: string; professorName?: string }): Promise<Class> {
    try {
      const { data: created } = await API.classes.create({
        name: data.name,
        professorId: data.professorId
      });
      return mapClassDTO(created);
    } catch (error) {
      throw error;
    }
  },

  async update(id: string, data: { name: string }): Promise<Class> {
    try {
      const { data: updated } = await API.classes.update(id, { name: data.name });
      return mapClassDTO(updated);
    } catch (error) {
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await API.classes.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async getClassStudents(classId: string): Promise<Array<{ id: string; name: string; email: string; role: string; studentRegistration?: string; createdAt: string }>> {
    try {
      const { data } = await API.classes.students(classId);
      return data.students || [];
    } catch (error) {
      throw error;
    }
  },
};
