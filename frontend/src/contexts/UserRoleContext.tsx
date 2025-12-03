"use client";

import { createContext, useContext, ReactNode } from "react";

import { useUserRole } from "../hooks/useUserRole";

interface UserRoleContextType {
  userRole: 'student' | 'assistant' | 'professor';
  isLoading: boolean;
}

const UserRoleContext = createContext<UserRoleContextType | undefined>(undefined);

interface UserRoleProviderProps {
  children: ReactNode;
}

export function UserRoleProvider({ children }: UserRoleProviderProps) {
  const userRoleData = useUserRole();

  return (
    <UserRoleContext.Provider value={userRoleData}>
      {children}
    </UserRoleContext.Provider>
  );
}

export function useUserRoleContext() {
  const context = useContext(UserRoleContext);
  if (context === undefined) {
    throw new Error('useUserRoleContext must be used within a UserRoleProvider');
  }
  return context;
}