import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { UserRole } from '../types';
import { authApi } from '../services/auth';
import { logger } from '../utils/logger';

interface UseUserRoleReturn {
  userRole: UserRole;
  isLoading: boolean;
}

export function useUserRole(): UseUserRoleReturn {
  const pathname = usePathname();
  const [userRole, setUserRoleState] = useState<UserRole>('professor');
  const [isLoading, setIsLoading] = useState(true);

  const detectUserRole = useCallback(async (): Promise<UserRole> => {
    if (typeof window === 'undefined') {
      return 'professor';
    }

    const token = authApi.getToken();
    if (token) {
      try {
        if (authApi.isTokenExpired(token)) {
          const newToken = await authApi.refreshAccessToken();
          if (newToken) {
            const payload = JSON.parse(atob(newToken.split('.')[1]));
            const role = payload.role || payload.userRole;
            if (['student', 'assistant', 'professor'].includes(role)) {
              return role as UserRole;
            }
          }
        } else {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const role = payload.role || payload.userRole;
          if (['student', 'assistant', 'professor'].includes(role)) {
            return role as UserRole;
          }
        }
      } catch (error) {
      }
    }

    const savedUserRole = localStorage.getItem('userRole');
    if (savedUserRole && ['student', 'assistant', 'professor'].includes(savedUserRole)) {
      return savedUserRole as UserRole;
    }

    if (pathname.includes('/professor/')) return 'professor';
    if (pathname.includes('/aluno/')) return 'student';
    if (pathname.includes('/monitor/')) return 'assistant';

    if (pathname.startsWith('/home/')) return 'student';
    if (pathname.startsWith('/convites')) {
      return 'professor';
    }

    return 'professor';
  }, [pathname]);

  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const detectedUserRole = await detectUserRole();
        setUserRoleState(detectedUserRole);
        setIsLoading(false);

        localStorage.setItem('userRole', detectedUserRole);
      } catch (error) {
        setUserRoleState('professor');
        setIsLoading(false);
      }
    };

    loadUserRole();
  }, [pathname, detectUserRole]);

  return {
    userRole,
    isLoading
  };
}