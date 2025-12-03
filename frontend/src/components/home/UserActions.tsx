"use client";

import React from "react";

import QuickActions from "./QuickActions";
import { QuickAction } from "@/types";

interface UserActionsProps {
  userRole: string;
}

export default function UserActions({ userRole }: UserActionsProps) {
  const getActionsForRole = (role: string): QuickAction[] => {
    switch (role) {
      case 'student':
        return [
          {
            href: "/listas",
            icon: (
              <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
            title: "Minhas Listas",
            description: "Ver suas listas disponíveis",
            hoverColor: "hover:border-green-300",
            iconColor: "text-green-600",
          }
        ];

      case 'professor':
        return [
          {
            href: "/listas",
            icon: (
              <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
            title: "Criar Listas",
            description: "Adicionar novas listas de exercícios",
            hoverColor: "hover:border-green-300",
            iconColor: "text-green-600",
          },
          {
            href: "/questoes",
            icon: (
              <svg className="w-6 h-6 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            ),
            title: "Criar Questões",
            description: "Gerenciar banco de questões",
            hoverColor: "hover:border-purple-300",
            iconColor: "text-purple-600",
          },
          {
            href: "/turmas",
            icon: (
              <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: "Acompanhar Turmas",
            description: "Ver progresso dos alunos",
            hoverColor: "hover:border-blue-300",
            iconColor: "text-blue-600",
          }
        ];

      case 'assistant':
        return [
          {
            href: "/listas",
            icon: (
              <svg className="w-6 h-6 text-green-600 group-hover:text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            ),
            title: "Criar Listas",
            description: "Adicionar novas listas de exercícios",
            hoverColor: "hover:border-green-300",
            iconColor: "text-green-600",
          },
          {
            href: "/questoes",
            icon: (
              <svg className="w-6 h-6 text-purple-600 group-hover:text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            ),
            title: "Criar Questões",
            description: "Gerenciar banco de questões",
            hoverColor: "hover:border-purple-300",
            iconColor: "text-purple-600",
          },
          {
            href: "/turmas",
            icon: (
              <svg className="w-6 h-6 text-blue-600 group-hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            title: "Acompanhar Turmas",
            description: "Ver progresso dos alunos",
            hoverColor: "hover:border-blue-300",
            iconColor: "text-blue-600",
          }
        ];

      default:
        return [];
    }
  };

  const actions = getActionsForRole(userRole);

  if (actions.length === 0) {
    return null;
  }

  return <QuickActions actions={actions} />;
}