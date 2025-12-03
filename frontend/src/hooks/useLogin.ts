import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../services/auth';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (email: string, password: string) => {
    setError('');
    setLoading(true);
    
    try {
      const result = await authApi.login(email, password);
      const { user, accessToken, refreshToken } = result.data;
      
      authApi.setTokens(accessToken, refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      router.push("/home");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao autenticar";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleLogin,
    loading,
    error,
    setError
  };
}
