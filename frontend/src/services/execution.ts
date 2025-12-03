import { API } from '../config/api';

export interface Language {
  id: number;
  name: string;
  key: string;
  isArchived: boolean;
}

export interface ExecutionStatus {
  healthy: boolean;
  judge0Url?: string;
}

export const getSupportedLanguages = async (): Promise<string[]> => {
  try {
    const { data } = await API.execution.getLanguages();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    return [];
  }
};

export const getExecutionStatus = async (): Promise<ExecutionStatus> => {
  try {
    const { data } = await API.execution.getStatus();
    return data;
  } catch (error) {
    throw error;
  }
};
