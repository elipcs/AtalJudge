'use client';

import { ReactNode } from 'react';

import { SidebarProvider, useSidebar } from '@/contexts/SidebarContext';
import NavigationBar from '@/components/NavigationBar';

interface UniversalLayoutProps {
  children: ReactNode;
  currentPage?: string;
}

function UniversalLayoutContent({ children, currentPage }: UniversalLayoutProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="fixed left-0 top-0 h-full z-30">
        <NavigationBar currentPage={currentPage} />
      </div>
      
      <div 
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'ml-16' : 'ml-64'
        }`}
        style={{
          marginLeft: 'var(--sidebar-width, 16rem)'
        }}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function UniversalLayout({ children, currentPage }: UniversalLayoutProps) {
  return (
    <SidebarProvider>
      <UniversalLayoutContent currentPage={currentPage}>
        {children}
      </UniversalLayoutContent>
    </SidebarProvider>
  );
}