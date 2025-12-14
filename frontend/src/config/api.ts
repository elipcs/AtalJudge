import { ApiResult, ApiEnvelope } from '@/types/api';
import { UserRole } from '@/types';
import {
  UserResponseDTO,
  ClassResponseDTO,
  QuestionResponseDTO,
  QuestionListResponseDTO,
  TestCaseResponseDTO,
  SubmissionResponseDTO,
  SubmissionDetailDTO,
  InviteResponseDTO,
  PaginatedSubmissionsResponse
} from '@/types/dtos';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  timeout?: number;
  signal?: AbortSignal;
}

// Get API base URL - works in both server and browser contexts
function getApiBaseUrl(): string {
  // Try environment variable first (build-time)
  if (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // In browser, use window.location.origin to get the current host
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${host}${port === ':3000' ? ':3333' : port}/api`;
  }

  // Fallback for server-side rendering
  return 'http://localhost:3333/api';
}

export const API_BASE_URL = getApiBaseUrl();

async function apiClient<T>(
  endpoint: string,
  config: RequestConfig = {}
): Promise<ApiResult<T>> {
  const {
    skipAuth = false,
    timeout = 30000,
    headers = {},
    ...restConfig
  } = config;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json; charset=utf-8',
    'User-Agent': 'AtalJudge-Frontend/1.0',
  };

  if (!skipAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      (defaultHeaders as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }
  }

  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  const requestConfig: RequestInit = {
    ...restConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
  };

  try {
    let controller: AbortController | null = null;
    let timeoutId: NodeJS.Timeout | null = null;

    if (config.signal) {
    } else {
      controller = new AbortController();
      timeoutId = setTimeout(() => {
        if (controller) controller.abort();
      }, timeout);
    }

    const signal = config.signal || controller?.signal;

    const response = await fetch(url, {
      ...requestConfig,
      signal: signal,
    });

    if (timeoutId) clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    const envelope = (isJson ? await response.json() : await response.text()) as ApiEnvelope<T> | string;

    if (!response.ok) {
      let errMessage = `HTTP ${response.status}`;

      if (typeof envelope === 'string') {
        errMessage = envelope;
      } else if (typeof envelope === 'object' && envelope !== null) {

        const errorObj = envelope as any;
        errMessage = errorObj.message ||
          errorObj.error ||
          errorObj.detail ||
          errorObj.msg ||
          (errorObj.data?.message || errorObj.data?.error || errorObj.data?.detail);

        if (!errMessage || errMessage === `HTTP ${response.status}`) {
          const values = Object.values(errorObj);
          const firstString = values.find(v => typeof v === 'string' && v.length > 0);
          if (firstString) errMessage = firstString as string;
        }
      }

      const isUnauthorized = response.status === 401 || (typeof errMessage === 'string' && errMessage.toLowerCase().includes('token expirado'));
      const canRefresh = !skipAuth && typeof window !== 'undefined';
      if (isUnauthorized && canRefresh) {
        try {
          const storedRefresh = localStorage.getItem('refreshToken');
          if (storedRefresh) {
            const refreshResp = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'User-Agent': 'AtalJudge-Frontend/1.0',
              },
              body: JSON.stringify({ refreshToken: storedRefresh }),
            });

            const refreshIsJson = refreshResp.headers.get('content-type')?.includes('application/json');
            const refreshEnvelope = (refreshIsJson ? await refreshResp.json() : await refreshResp.text()) as any;

            if (refreshResp.ok) {

              const refreshData = (typeof refreshEnvelope === 'object' && 'data' in refreshEnvelope) ? refreshEnvelope.data : refreshEnvelope;
              const newAccessToken = refreshData.accessToken || refreshData.access_token;
              const newRefreshToken = refreshData.refreshToken || refreshData.refresh_token;

              if (newAccessToken && newRefreshToken) {
                localStorage.setItem('token', newAccessToken);
                localStorage.setItem('refreshToken', newRefreshToken);

                const retriedHeaders: HeadersInit = {
                  ...((requestConfig.headers as HeadersInit) || {}),
                  'Content-Type': 'application/json; charset=utf-8',
                };
                (retriedHeaders as Record<string, string>)['Authorization'] = `Bearer ${newAccessToken}`;

                const retryResp = await fetch(url, {
                  ...requestConfig,
                  headers: retriedHeaders,
                  signal: controller?.signal || signal,
                });

                const retryContentType = retryResp.headers.get('content-type');
                const retryIsJson = retryContentType?.includes('application/json');
                const retryEnvelope = (retryIsJson ? await retryResp.json() : await retryResp.text()) as ApiEnvelope<T> | string;

                if (!retryResp.ok) {
                  const retryErrMessage = typeof retryEnvelope === 'string' ? retryEnvelope : (retryEnvelope as any)?.message || `HTTP ${retryResp.status}`;
                  throw new ApiError(retryErrMessage, retryResp.status);
                }

                const successRetryEnvelope = retryEnvelope as ApiEnvelope<T>;
                const retryData = (typeof successRetryEnvelope === 'object' && 'data' in successRetryEnvelope)
                  ? (successRetryEnvelope as any).data as T
                  : (retryEnvelope as unknown as T);

                let finalRetryData: T = retryData;
                if (finalRetryData && typeof finalRetryData === 'object') {
                  const dataObj = finalRetryData as any;
                  if (dataObj.access_token || dataObj.refresh_token) {
                    finalRetryData = {
                      ...dataObj,
                      accessToken: dataObj.accessToken || dataObj.access_token,
                      refreshToken: dataObj.refreshToken || dataObj.refresh_token,
                    } as T;
                  }
                }

                return {
                  data: finalRetryData,
                  success: typeof successRetryEnvelope === 'object' ? (successRetryEnvelope as any).success !== false : true,
                  message: typeof successRetryEnvelope === 'object' ? (successRetryEnvelope as any).message : undefined,
                  status: retryResp.status,
                };
              }
            }
          }
        } catch (_refreshErr) {

        }

        try {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
        } catch { }
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }

      throw new ApiError(errMessage, response.status);
    }

    const successEnvelope = envelope as ApiEnvelope<T>;
    let data = (typeof successEnvelope === 'object' && 'data' in successEnvelope)
      ? (successEnvelope as any).data as T
      : (envelope as unknown as T);

    if (data && typeof data === 'object') {
      const dataObj = data as any;

      if (dataObj.access_token || dataObj.refresh_token) {
        data = {
          ...dataObj,
          accessToken: dataObj.accessToken || dataObj.access_token,
          refreshToken: dataObj.refreshToken || dataObj.refresh_token,
        } as T;
      }
    }

    return {
      data,
      success: typeof successEnvelope === 'object' ? (successEnvelope as any).success !== false : true,
      message: typeof successEnvelope === 'object' ? (successEnvelope as any).message : undefined,
      status: response.status,
    };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error) {
      if (error.name === 'AbortError') throw new ApiError('Timeout da requisição', 408, 'TIMEOUT');
      throw new ApiError(error.message, 0, 'NETWORK_ERROR');
    }
    throw new ApiError('Erro desconhecido', 0, 'UNKNOWN_ERROR');
  }
}

export async function get<T>(endpoint: string, config?: RequestConfig): Promise<ApiResult<T>> {
  return apiClient<T>(endpoint, { ...config, method: 'GET' });
}

export async function post<T>(
  endpoint: string,
  body?: unknown,
  config?: RequestConfig
): Promise<ApiResult<T>> {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function put<T>(
  endpoint: string,
  body?: unknown,
  config?: RequestConfig
): Promise<ApiResult<T>> {
  return apiClient<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

export async function del<T>(endpoint: string, config?: RequestConfig): Promise<ApiResult<T>> {
  return apiClient<T>(endpoint, { ...config, method: 'DELETE' });
}

export const API = {

  auth: {
    login: (email: string, password: string) =>
      post<{ user: UserResponseDTO; accessToken: string; refreshToken: string }>(
        '/auth/login', { email, password }, { skipAuth: true }
      ),
    register: (data: { name: string; email: string; password: string; studentRegistration?: string; classId?: string }) =>
      post<{ user: UserResponseDTO; accessToken: string; refreshToken: string }>(
        '/auth/register', data, { skipAuth: true }
      ),
    logout: (refreshToken: string) =>
      post<null>('/auth/logout', { refresh_token: refreshToken }),
    refresh: (refreshToken: string) =>
      post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh', { refreshToken }, { skipAuth: true }
      ),
  },

  users: {
    me: () => get<{ userId: string; email: string; role: UserRole }>('/users/me'),
    profile: () => get<UserResponseDTO>('/users/profile'),
    updateProfile: (data: Partial<UserResponseDTO>) => put<UserResponseDTO>('/users/profile', data),
    changePassword: (data: { currentPassword: string; newPassword: string }) => post<null>('/users/change-password', data),
  },

  classes: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return get<ClassResponseDTO[]>(`/classes${query}`);
    },
    get: (id: string, withRelations = false) => {
      const query = withRelations ? '?withRelations=true' : '';
      return get<ClassResponseDTO>(`/classes/${id}${query}`);
    },
    create: (data: { name: string; professorId: string; professorName?: string }) => post<ClassResponseDTO>('/classes', data),
    update: (id: string, data: Partial<ClassResponseDTO>) => put<ClassResponseDTO>(`/classes/${id}`, data),
    delete: (id: string) => del<null>(`/classes/${id}`),
    students: (id: string) => get<{ students: Array<{ id: string; name: string; email: string; role: string; studentRegistration?: string; createdAt: string }> }>(`/classes/${id}/students`),
    addStudent: (classId: string, studentId: string) => post<null>(`/classes/${classId}/students`, { studentId }),
    removeStudent: (classId: string, studentId: string) => del<null>(`/classes/${classId}/students/${studentId}`),
  },

  lists: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return get<{ questionLists: QuestionListResponseDTO[]; count: number }>(`/lists${query}`);
    },
    get: (id: string) => get<QuestionListResponseDTO>(`/lists/${id}`),
    create: (data: Partial<QuestionListResponseDTO>) => post<QuestionListResponseDTO>('/lists', data),
    update: (id: string, data: Partial<QuestionListResponseDTO>) => put<QuestionListResponseDTO>(`/lists/${id}`, data),
    updateScoring: (id: string, data: { scoringMode?: string; maxScore?: number; minQuestionsForMaxScore?: number; questionGroups?: any[] }) =>
      apiClient<QuestionListResponseDTO>(`/lists/${id}/scoring`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => del<null>(`/lists/${id}`),
    publish: (id: string) => post<QuestionListResponseDTO>(`/lists/${id}/publish`),
    unpublish: (id: string) => post<QuestionListResponseDTO>(`/lists/${id}/unpublish`),
    addQuestion: (questionListId: string, questionId: string) => post<null>(`/lists/${questionListId}/questions`, { questionId }),
    removeQuestion: (questionListId: string, questionId: string) => del<null>(`/lists/${questionListId}/questions/${questionId}`),
  },

  questions: {
    list: () => get<{ questions: QuestionResponseDTO[] }>('/questions'),
    get: (id: string) => get<QuestionResponseDTO>(`/questions/${id}`),
    create: (data: Partial<QuestionResponseDTO>) => post<QuestionResponseDTO>('/questions', data),
    update: (id: string, data: Partial<QuestionResponseDTO>) => put<QuestionResponseDTO>(`/questions/${id}`, data),
    delete: (id: string) => del<null>(`/questions/${id}`),
  },

  invites: {
    list: () => get<InviteResponseDTO[]>('/invites'),
    get: (id: string) => get<InviteResponseDTO>(`/invites/${id}`),
    create: (data: { role: UserRole; maxUses: number; expirationDays: number; classId?: string; className?: string; createdBy: string; creatorName: string }) => post<{ invite: InviteResponseDTO }>(
      '/invites/create', data
    ),
    delete: (id: string) => del<null>(`/invites/${id}`),
    revoke: (id: string) => post<null>(`/invites/${id}/revoke`),
    verify: (token: string) => post<{ id: string; role: UserRole; token: string; expiresAt: string; currentUses: number; maxUses: number; classId?: string; className?: string; createdBy: string; creatorName: string }>(
      '/invites/verify', { token }, { skipAuth: true }
    ),
  },

  submissions: {
    list: (params?: Record<string, string>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return get<PaginatedSubmissionsResponse>(`/submissions${query}`);
    },
    get: (id: string) => get<SubmissionResponseDTO>(`/submissions/${id}`),
    getResults: (id: string) => get<any>(`/submissions/${id}/results`),
    submit: (data: { questionId: string; code: string; language: string }) => post<SubmissionDetailDTO>(
      '/submissions/submit', data
    ),
    resubmit: (id: string) => post<SubmissionResponseDTO>(`/submissions/${id}/resubmit`),
  },

  testCases: {
    list: (questionId: string, config?: RequestConfig) => get<TestCaseResponseDTO[]>(`/questions/${questionId}/testcases`, config),
    get: (testCaseId: string) => get<TestCaseResponseDTO>(`/testcases/${testCaseId}`),
    create: (questionId: string, data: Omit<TestCaseResponseDTO, 'id' | 'createdAt'>) => post<TestCaseResponseDTO>(`/questions/${questionId}/testcases`, data),
    update: (questionId: string, testCaseId: string, data: Partial<TestCaseResponseDTO>) =>
      post<TestCaseResponseDTO>(`/testcases/${testCaseId}`, data),
    delete: (questionId: string, testCaseId: string) =>
      del<null>(`/testcases/${testCaseId}`),
    reorder: (questionId: string, testCaseIds: string[]) =>
      post<null>(`/questions/${questionId}/testcases/reorder`, { testCaseIds }),
    bulkUpdate: (questionId: string, data: { testCases: Array<{ id?: string; input: string; expectedOutput: string; weight: number }> }) =>
      put<TestCaseResponseDTO[]>(`/questions/${questionId}/testcases/bulk`, data),
    generate: (questionId: string, data: { oracleCode: string; language: string; count: number; use_supervision?: boolean }, config?: RequestConfig) =>
      post<{ testCases: Array<{ input: string; expectedOutput: string }>; totalGenerated: number; algorithmTypeDetected?: string }>(
        `/questions/${questionId}/testcases/generate`, data, config
      ),
    importFromFile: async (questionId: string, formData: FormData) => {
      const url = `${API_BASE_URL}/questions/${questionId}/testcases/import`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erro ao importar arquivo' }));
        throw new Error(errorData.message || 'Erro ao importar arquivo');
      }

      return response.json();
    },
  },

  password: {
    forgotPassword: (email: string) =>
      post<{ message: string }>('/auth/forgot-password', { email }, { skipAuth: true }),
    resetPassword: (token: string, password: string) =>
      post<{ message: string }>('/auth/reset-password', { token, newPassword: password }, { skipAuth: true, timeout: 10000 }),
    verifyResetToken: (token: string) =>
      post<{ valid: boolean; message?: string }>('/auth/verify-reset-token', { token }, { skipAuth: true }),
  },

  config: {
    getAllowedIps: () => get<{ allowedIPs: Array<{ id: string; ip: string; description: string; active: boolean; createdAt: string }> }>(
      '/config/allowed-ips'
    ),
    checkAllowedIp: (questionListId?: string) => {
      const query = questionListId ? `?questionListId=${questionListId}` : '';
      return get<{ allowed: boolean }>(`/config/allowed-ips/check${query}`);
    },
    toggleAllowedIp: (id: string) => put<null>(`/config/allowed-ips/${id}/toggle`),
    deleteAllowedIp: (id: string) => del<null>(`/config/allowed-ips/${id}`),
    createAllowedIp: (data: { ip: string; description: string }) => post<null>('/config/allowed-ips', data),
    getStudents: () => get<Array<{ id: string; name: string; email: string; studentRegistration?: string; classId?: string; className?: string; submissionsCount?: number; createdAt?: string }>>(
      '/users/role/student'
    ),
    removeStudents: (studentIds: string[]) =>
      post<null>('/config/remove-students', { studentIds }),
    systemReset: (resetOptions: {
      resetSubmissions: boolean;
      resetStudents: boolean;
      resetClasses: boolean;
      resetLists: boolean;
      resetMonitors: boolean;
      resetProfessors: boolean;
      resetInvites: boolean;
      resetAllowedIPs: boolean;
    }) => post<null>('/config/system-reset', resetOptions),
  },

  execution: {
    getLanguages: () => get<string[]>('/execution/languages'),
    getStatus: () => get<{ healthy: boolean; judge0Url?: string }>("/execution/status"),
  },
};

export async function diagnoseBackendConnection(): Promise<{
  backend: boolean;
  message?: string;
}> {
  const result = {
    backend: false,
    message: undefined as string | undefined,
  };

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      cache: 'no-store',
    });
    result.backend = response.ok;
    if (!response.ok) {
      result.message = `Backend retornou status ${response.status}`;
    }
  } catch (error) {
    result.backend = false;
    result.message = error instanceof Error ? error.message : 'Backend não está respondendo';
  }

  return result;
}

export const diagnoseConnection = diagnoseBackendConnection;
export { apiClient };
