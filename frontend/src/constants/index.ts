export const PROGRAMMING_LANGUAGES = {
  PYTHON: 'python',
  JAVA: 'java'
} as const;

export const LANGUAGE_OPTIONS = [
  { value: PROGRAMMING_LANGUAGES.PYTHON, label: 'Python' },
  { value: PROGRAMMING_LANGUAGES.JAVA, label: 'Java' }
];

export const JUDGE_TYPES = {
  LOCAL: 'local'
} as const;

export const JUDGE_TYPE_OPTIONS = [
  {
    value: JUDGE_TYPES.LOCAL,
    label: 'Local (Judge0)',
    description: 'Executado localmente com casos de teste cadastrados'
  }
];

export const SUBMISSION_STATUS = {
  SUBMITTED: 'submitted',
  ACCEPTED: 'accepted',
  FAILED: 'failed',
  PENDING: 'pending',
  RUNNING: 'running',
  QUEUE: 'queue'
} as const;

export const SUBMISSION_STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: SUBMISSION_STATUS.ACCEPTED, label: 'Aceitas' },
  { value: SUBMISSION_STATUS.FAILED, label: 'Rejeitadas' }
];

export const USER_ROLES = {
  STUDENT: 'student',
  PROFESSOR: 'professor',
  ASSISTANT: 'assistant'
} as const;

export const DEFAULT_CONFIG = {
  TIME_LIMIT: 5000,
  MEMORY_LIMIT: 256,
  MAX_SUBMISSIONS_PER_MINUTE: 10,
  MAX_FILE_SIZE: 10,
  DEFAULT_POINTS: 10
} as const;

export const NOTIFICATION_CONFIG = {
  EMAIL_SUBMISSION: 'emailSubmissao',
  EMAIL_NEW_LIST: 'emailNovaLista',
  EMAIL_DEADLINE: 'emailDeadline',
  PUSH_NOTIFICATIONS: 'pushNotifications'
} as const;

export const MESSAGES = {
  LOADING: 'Carregando...',
  ERROR_GENERIC: 'Ocorreu um erro inesperado',
  ERROR_LOADING_DATA: 'Erro ao carregar dados',
  ERROR_LOADING_USER: 'Erro ao carregar usuário',
  ERROR_LOADING_SUBMISSIONS: 'Erro ao carregar submissões',
  ERROR_LOADING_LISTS: 'Erro ao carregar listas',
  ERROR_LOADING_NOTICES: 'Erro ao carregar avisos',
  SUCCESS_SAVED: 'Dados salvos com sucesso',
  SUCCESS_CREATED: 'Criado com sucesso',
  SUCCESS_UPDATED: 'Atualizado com sucesso',
  SUCCESS_DELETED: 'Excluído com sucesso'
} as const;

export const UI_CONFIG = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  TOAST_DURATION: 5000,
  MODAL_Z_INDEX: 50,
  DROPDOWN_Z_INDEX: 10
} as const;

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50],
  MAX_PAGE_SIZE: 100
} as const;

export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 12,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  TITLE_MAX_LENGTH: 200
} as const;

export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000,
  LONG_TTL: 30 * 60 * 1000,
  SHORT_TTL: 1 * 60 * 1000
} as const;

export const API_CONFIG = {
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000
} as const;

export const THEME_CONFIG = {
  COLORS: {
    PRIMARY: 'blue',
    SECONDARY: 'slate',
    SUCCESS: 'green',
    WARNING: 'yellow',
    ERROR: 'red',
    INFO: 'blue'
  },
  BORDER_RADIUS: {
    SM: 'rounded-lg',
    MD: 'rounded-xl',
    LG: 'rounded-2xl',
    XL: 'rounded-3xl'
  }
} as const;
