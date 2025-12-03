
export function handleTokenError(error: any): void {
  
  if (error?.response?.data?.error === 'TOKEN_REVOKED' || 
      error?.code === 'TOKEN_REVOKED' ||
      error?.message?.includes('revoked')) {

    if (typeof window !== 'undefined') {
      localStorage.clear();
    }

    if (typeof window !== 'undefined') {
      const message = encodeURIComponent(
        'Sua sessão foi invalidada por motivos de segurança. Por favor, faça login novamente.'
      );
      window.location.href = `/login?message=${message}`;
    }
  }
}

export function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.response?.status === 401 ||
    error?.code === 'TOKEN_REVOKED' ||
    error?.message?.includes('revoked')
  );
}

