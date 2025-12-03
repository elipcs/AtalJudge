import { User, Class, Student, Submission, QuestionList, SystemNotice } from '../types';
import { API } from '../config/api';
import { classesApi } from './classes';
import { listsApi } from './lists';
import { logger } from '../utils/logger';

export const homeApi = {
  student: {
    async getStudentData(): Promise<{
      currentClass: {
        id: string;
        name: string;
        professorId: string;
        professorName: string;
      };
      availableLists: QuestionList[];
      classParticipants: Student[];
    }> {
      try {
        const userResponse = await API.users.profile();
        const currentUser = userResponse.data as User;
        
        let userClass: Class | null = null;
        
        if (currentUser.classId) {
          userClass = await classesApi.getById(currentUser.classId);
        }
        
        if (!userClass) {
          const allClasses = await classesApi.getAll();
          userClass = Array.isArray(allClasses)
            ? allClasses.find(cls => cls.students && cls.students.some(student => student.id === currentUser.id)) || null
            : null;
        }
        
        if (!userClass) {
          throw new Error('Usuário não encontrado em nenhuma turma');
        }
        
        let availableLists: QuestionList[] = [];
        try {
          const allLists = await listsApi.getLists();
          const listsArray = Array.isArray(allLists) ? allLists : [];
          availableLists = listsArray.filter((list: QuestionList) => 
            list.classIds && list.classIds.includes(userClass.id)
          );
        } catch (_error) {
          availableLists = [];
        }
        
        return {
          currentClass: {
            id: userClass.id,
            name: userClass.name,
            professorId: userClass.professor?.id || '',
            professorName: userClass.professor?.name || ''
          },
          availableLists,
          classParticipants: (userClass.students || []).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        };
      } catch (error) {
        throw error;
      }
    },

    async getStudentSubmissions(userId: string, limit: number = 5): Promise<Submission[]> {
      try {
        const response = await API.submissions.list({ userId, limit: String(limit) });
        const data = response.data as any;
        const submissions = data.submissions || data || [];
        return Array.isArray(submissions) ? submissions.slice(0, limit) : [];
      } catch (error) {
        return [];
      }
    }
  },

  staff: {
    async getStaffData(): Promise<{
      classes: Class[];
      students: Student[];
      submissions: Submission[];
      systemNotices: SystemNotice[];
    }> {
      try {
        const [classesData, submissionsData] = await Promise.allSettled([
          classesApi.getAll(),
          API.submissions.list({ limit: '10' }).catch(() => ({ data: [] }))
        ]);

        const classes = classesData.status === 'fulfilled' && Array.isArray(classesData.value) ? classesData.value : [];
        
        let submissions: Submission[] = [];
        if (submissionsData.status === 'fulfilled') {
          const data = submissionsData.value.data as any;
          submissions = data.submissions || data || [];
        }

        const allStudents = classes.flatMap(cls => cls.students || []).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

        return {
          classes,
          students: allStudents,
          submissions: Array.isArray(submissions) ? submissions : [],
          systemNotices: [] 
        };
      } catch (error) {
        return {
          classes: [],
          students: [],
          submissions: [],
          systemNotices: []
        };
      }
    },

    async getSystemNotices(): Promise<SystemNotice[]> {
      
      return [];
    },

    async getActiveLists(): Promise<QuestionList[]> {
      try {
        const response = await API.lists.list({});
        const data = response.data as any;

        if (!data) return [];

        const lists = data.questionLists || data.data?.questionLists || data.questionLists || data;
        const listsArray = Array.isArray(lists) ? lists : [];

        return listsArray.map((list: any) => {
          const now = new Date();
          const startDate = list.startDate ? new Date(list.startDate) : null;
          const endDate = list.endDate ? new Date(list.endDate) : null;
          
          let calculatedStatus: 'scheduled' | 'open' | 'closed' = 'open';
          
          if (startDate && now < startDate) {
            calculatedStatus = 'scheduled';
          } else if (endDate && now > endDate) {
            calculatedStatus = 'closed';
          } else {
            calculatedStatus = 'open';
          }
          
          return {
            ...list,
            calculatedStatus
          };
        });
      } catch (error) {
        return [];
      }
    }
  },

  user: {
    async getCurrentUser(): Promise<User> {
      try {
        const response = await API.users.profile();
        
        if (!response.success) {
          throw new Error('Erro ao buscar dados do usuário');
        }

        const userData = response.data as User;
        return userData;
      } catch (error) {
        throw error;
      }
    }
  }
};
