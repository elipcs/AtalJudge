"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { authApi } from "@/services/auth";
import { logger } from "@/utils/logger";

interface AuthGuardProps {
  children: React.ReactNode;
}

const PROTECTED_ROUTES = [
  '/home',
  '/turmas',
  '/listas',
  '/convites',
  '/submissoes',
  '/configuracoes',
  '/perfil',
  '/questoes',
  '/ajuda'
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/reset-senha',
  '/not-found',
  '/api'
];

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const isPublicRoute = PUBLIC_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
      );

      if (isPublicRoute) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      const isProtectedRoute = PROTECTED_ROUTES.some(route =>
        pathname === route || pathname.startsWith(route + '/')
      );

      if (!isProtectedRoute) {
        setIsAuthenticated(true);
        setIsChecking(false);
        return;
      }

      try {
        const isAuth = await authApi.checkAuthentication();

        if (!isAuth) {
          setIsChecking(false);
          router.replace("/login");
          return;
        }

        setIsAuthenticated(true);
        setIsChecking(false);
      } catch (error) {
        setIsChecking(false);
        router.replace("/login");
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}