"use client";

import React from "react";

import { User } from "@/types";
import { translateUserRole } from "../../utils/roleTranslations";

interface WelcomeHeaderProps {
  currentUser: User;
  title?: string;
  subtitle?: string;
  extraInfo?: React.ReactNode;
  children?: React.ReactNode;
}

export default function WelcomeHeader({
  currentUser,
  title,
  subtitle,
  extraInfo,
  children
}: WelcomeHeaderProps) {
  const firstName = currentUser.name.split(' ')[0];
  const displayTitle = title || `Bem-vindo, ${firstName}!`;

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">

          {}
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
              {displayTitle}
            </h1>
            {subtitle && (
              <div className="flex items-center gap-2 text-slate-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="font-medium">{subtitle}</span>
              </div>
            )}
            {extraInfo && (
              <div className="flex items-center gap-2 mt-1 text-slate-600 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {extraInfo}
              </div>
            )}
            {children}
          </div>
        </div>

        {}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="font-semibold text-blue-700">{currentUser.name}</div>
            <div className="text-xs text-slate-600">{translateUserRole(currentUser.role)}</div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl border border-blue-200 flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}