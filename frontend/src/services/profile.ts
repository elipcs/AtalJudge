import { API } from '../config/api';
import { UserResponseDTO } from '@/types/dtos';

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: 'professor' | 'student' | 'assistant';
  studentRegistration?: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface UpdateProfileData {
  name: string;
  studentRegistration?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  userId?: string;
}

export const profileApi = {

  async getProfile(): Promise<ProfileData> {
    try {
      const { data } = await API.users.profile();
      const userData = data as UserResponseDTO;

      const profileData: ProfileData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        studentRegistration: userData.studentRegistration,
        createdAt: String(userData.createdAt),
        lastLogin: userData.lastLogin ? String(userData.lastLogin) : undefined
      };

      return profileData;
    } catch (error) {
      throw error;
    }
  },

  async updateProfile(data: UpdateProfileData): Promise<ProfileData> {
    try {
      const backendData = {
        name: data.name,
        studentRegistration: data.studentRegistration
      };

      const { data: userData } = await API.users.updateProfile(backendData);
      const profileData: ProfileData = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        studentRegistration: userData.studentRegistration,
        createdAt: String(userData.createdAt),
        lastLogin: userData.lastLogin ? String(userData.lastLogin) : undefined
      };

      return profileData;
    } catch (error) {
      throw error;
    }
  },

  async changePassword(data: ChangePasswordData): Promise<boolean> {
    try {
      await API.users.changePassword(data);
      return true;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error(String(error));
    }
  },

};
