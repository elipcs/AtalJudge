export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  classId?: string;
}

export type UserRole = 'student' | 'assistant' | 'professor';

export interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration: string;
  role: string;
  classId: string;
  grades: {
    id: string;
    questionListId: string;
    score: string | number;
    createdAt: string;
    updatedAt: string;
  }[];
  createdAt: string;
}

export interface Class {
  id: string;
  name: string;
  professor: Professor | null;
  students: Student[];
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Professor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Question {
  id: string;
  title: string;
  points?: number;
  description?: string;
  text: string;
  examples: Array<{
    input: string;
    output: string;
  }>;
  timeLimit: string;
  memoryLimit: string;
  referenceCode?: string;
  referenceLanguage?: 'python' | 'java';
  testCases?: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>;
  group?: string;
  source?: string;
  tags?: string[];
}

export interface Submission {
  id: string;
  questionList: { id: string; name: string };
  question: { id: string; name: string };
  student: { id: string; name: string; class: { id: string; name: string } };
  status: 'pending' | 'accepted' | 'error' | 'timeout';
  score: number;
  language: string;
  code: string;
  submittedAt: string;
  verdict: string;
}

export interface Invite {
  id: string;
  role: 'student' | 'assistant' | 'professor';
  token: string;
  link: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
  maxUses: number;
  currentUses: number;
  classId?: string;
  className?: string;
  createdBy: string;
  creatorName: string;
}

export interface QuestionList {
  id: string;
  title: string;
  description?: string;
  classIds: string[];
  questions: Question[];
  questionCount?: number;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
  calculatedStatus?: 'scheduled' | 'open' | 'closed';
  scoringMode?: 'simple' | 'groups';
  minQuestionsForMaxScore?: number;
  maxScore?: number;
  questionGroups?: Array<{
    id: string;
    name: string;
    questionIds: string[];
    weight: number;
    percentage?: number;
  }>;
  isRestricted?: boolean;
  countTowardScore?: boolean;
}

export interface QuickAction {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  hoverColor: string;
  iconColor: string;
}

export interface SystemNotice {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  date: string;
}

export interface QuestionGroup {
  id: string;
  name: string;
  questions: string[];
  minRequired: number;
  pointsPerQuestion: number;
  color: string;
}

export interface QuestionArrangement {
  id: string;
  name: string;
  description: string;
  groups: QuestionGroup[];
  requireAllGroups: boolean;
  maxScore: number;
  passingScore: number;
}

export interface GroupResult {
  questionsSolved: string[];
  points: number;
  completed: boolean;
  progress: string;
  groupInfo: QuestionGroup;
}

export interface ArrangementResult {
  completed: boolean;
  groups: { [groupId: string]: GroupResult };
  totalScore: number;
  finalGrade: number;
  requirementsMet: boolean;
}
