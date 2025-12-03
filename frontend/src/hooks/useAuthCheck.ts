import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../services/auth';

export function useAuthCheck() {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = authApi.getToken();
      if (token && !authApi.isTokenExpired(token)) {
        router.push("/home");
        return;
      }
      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  return { checkingAuth };
}
