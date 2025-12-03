export const roleTranslations = {
  student: 'Aluno',
  professor: 'Professor', 
  assistant: 'Monitor'
} as const;

export function translateUserRole(role: string): string {
  return roleTranslations[role as keyof typeof roleTranslations] || role;
}

export function getRoleColor(role: string): {
  bg: string;
  text: string;
  border: string;
} {
  switch (role) {
    case 'professor':
      return {
        bg: 'bg-gradient-to-r from-purple-50 to-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200'
      };
    case 'student':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-blue-100',
        text: 'text-blue-700',
        border: 'border-blue-200'
      };
    case 'assistant':
      return {
        bg: 'bg-gradient-to-r from-green-50 to-green-100',
        text: 'text-green-700',
        border: 'border-green-200'
      };
    default:
      return {
        bg: 'bg-gradient-to-r from-gray-50 to-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-200'
      };
  }
}
