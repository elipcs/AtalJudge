import { API } from '../config/api';
import { logger } from '../utils/logger';
import { UserResponseDTO } from '@/types/dtos';
import { ApiResult } from '@/types/api';

export interface RegistrationFormData {
  name: string;
  email: string;
  studentRegistration?: string;
  password: string;
  confirmPassword: string;
}

export interface TokenInfo {
  role: 'student' | 'assistant' | 'professor';
  classId?: string;
  className?: string;
  professor?: string;
  valid: boolean;
  expires: string;
}

export const authApi = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  },

  getRefreshToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  },

  setToken(token: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
  },

  setRefreshToken(refreshToken: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("refreshToken", refreshToken);
  },

  setTokens(token: string, refreshToken: string) {
    if (typeof window === "undefined") return;
    localStorage.setItem("token", token);
    localStorage.setItem("refreshToken", refreshToken);
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },

  async checkAuthentication(): Promise<boolean> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (!token && !refreshToken) {
      return false;
    }

    if (token && !this.isTokenExpired(token)) {
      return true;
    }

    if (refreshToken) {
      try {
        const newToken = await this.refreshAccessToken();
        return !!newToken;
      } catch (error) {
        return false;
      }
    }

    return false;
  },

  async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return null;

    try {
      const { data } = await API.auth.refresh(refreshToken);
      const { accessToken, refreshToken: newRefreshToken } = data;
      if (accessToken && newRefreshToken) {
        this.setTokens(accessToken, newRefreshToken);
        return accessToken;
      }
      return null;
    } catch (error) {
      this.removeTokens();
      return null;
    }
  },

  async logout(): Promise<boolean> {
    const token = this.getToken();
    if (!token) {
      this.removeTokens();
      return true;
    }

    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await API.auth.logout(refreshToken);
      }
      this.removeTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('manual-userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }
      return true;
    } catch (error) {
      this.removeTokens();
      if (typeof window !== "undefined") {
        localStorage.removeItem('userRole');
        localStorage.removeItem('user');
        localStorage.removeItem('manual-userRole');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
      }
      return true;
    }
  },

  async login(email: string, password: string): Promise<ApiResult<{ user: UserResponseDTO; accessToken: string; refreshToken: string }>> {
    return API.auth.login(email, password);
  },

  async registerUser(
    formData: RegistrationFormData,
    tokenInfo: TokenInfo | null
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const requestBody = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: tokenInfo?.role,
        studentRegistration: formData.studentRegistration,
        classId: tokenInfo?.classId,
        className: tokenInfo?.className
      };

      const result = await API.auth.register(requestBody);
      return {
        success: result.success,
        message: result.message || 'Cadastro realizado com sucesso'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao realizar cadastro'
      };
    }
  },

  removeToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
  },

  removeRefreshToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("refreshToken");
  },

  removeTokens() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
  },
};
