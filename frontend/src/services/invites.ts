import { API } from '../config/api';
import { logger } from '../utils/logger';
import { UserRole, } from '@/types';
import { InviteResponseDTO } from '@/types/dtos';

export const invitesApi = {
  async getAll(): Promise<InviteResponseDTO[]> {
    try {
      const { data } = await API.invites.list();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      throw error;
    }
  },

  async getById(id: string): Promise<InviteResponseDTO | null> {
    try {
      const { data } = await API.invites.get(id);
      return data || null;
    } catch (error) {
      throw error;
    }
  },

  async create(data: {
    role: UserRole;
    maxUses: number;
    expirationDays: number;
    classId?: string;
    className?: string;
    createdBy: string;
    creatorName: string;
  }): Promise<InviteResponseDTO> {
    try {
      const { data: result } = await API.invites.create({
        role: data.role,
        classId: data.classId,
        className: data.className,
        maxUses: data.maxUses,
        expirationDays: data.expirationDays,
        createdBy: data.createdBy,
        creatorName: data.creatorName,
      });
      return result.invite;
    } catch (error) {
      throw error;
    }
  },

  async revoke(id: string): Promise<boolean> {
    try {
      await API.invites.revoke(id);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async delete(id: string): Promise<boolean> {
    try {
      await API.invites.delete(id);
      return true;
    } catch (error) {
      throw error;
    }
  },

  async validateToken(token: string): Promise<InviteResponseDTO | null> {
    try {
      const { data } = await API.invites.verify(token);
      if (!data) return null;
      return {
        id: data.id,
        role: data.role,
        token: data.token,
        link: `${typeof window !== 'undefined' ? window.location.origin : ''}/cadastro?token=${data.token}`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(data.expiresAt),
        isUsed: data.currentUses >= data.maxUses,
        usedAt: undefined,
        maxUses: data.maxUses,
        currentUses: data.currentUses,
        classId: data.classId,
        className: data.className,
        createdById: data.createdBy,
        creatorName: data.creatorName
      };
    } catch (error) {
      return null;
    }
  },

  async useToken(token: string): Promise<boolean> {
    try {
      const { data } = await API.invites.verify(token);
      if (!data) return false;
      if (data.currentUses >= data.maxUses) return false;
      return true;
    } catch (error) {
      return false;
    }
  }
};
