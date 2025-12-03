import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { authApi } from "@/services/auth";

export function useAuthGuard(timeoutMs: number = 10000) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout: Verificação de autenticação demorou muito'));
        }, timeoutMs);
      });

      const authPromise = async (): Promise<boolean> => {
        const token = authApi.getToken();
        const refreshToken = authApi.getRefreshToken();

        if (!token && !refreshToken) {
          return false;
        }

        if (token) {
          if (authApi.isTokenExpired(token)) {
            if (refreshToken) {
              const newToken = await authApi.refreshAccessToken();
              return !!newToken;
            } else {
              return false;
            }
          } else {
            return true;
          }
        } else if (refreshToken) {
          const newToken = await authApi.refreshAccessToken();
          return !!newToken;
        }

        return false;
      };

      try {
        const isAuthenticated = await Promise.race([authPromise(), timeoutPromise]);
        
        if (!isAuthenticated) {
          router.replace("/login");
          return;
        }

        setIsChecking(false);
      } catch (error) {
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router, timeoutMs]);

  return { isChecking };
}
