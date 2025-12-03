'use client';

import { usePathname } from 'next/navigation';

import UniversalLayout from '@/components/UniversalLayout';
import { UserRoleProvider } from '@/contexts/UserRoleContext';
import AuthGuard from '@/components/AuthGuard';

const PROTECTED_ROUTES = [
  '/turmas',
  '/listas',
  '/convites',
  '/submissoes',
  '/configuracoes',
  '/perfil',
  '/home',
  '/questoes',
  '/ajuda'
];

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/login',
  '/cadastro',
  '/esqueci-senha',
  '/reset-senha',
  '/not-found'
];

export default function AppWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <UserRoleProvider>
        <AppWrapperContent>{children}</AppWrapperContent>
      </UserRoleProvider>
    </AuthGuard>
  );
}

function AppWrapperContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const shouldHaveNavigation = PROTECTED_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  const isPublicRoute = PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (shouldHaveNavigation) {
    const currentPage = pathname === '/' || pathname === '/home' ? 'home' :
      pathname.replace('/', '').split('/')[0] || 'home';

    return (
      <UniversalLayout currentPage={currentPage}>
        {children}
      </UniversalLayout>
    );
  }

  return <>{children}</>;
}
