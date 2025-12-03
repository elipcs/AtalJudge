"use client";

import React from "react";
import Link from "next/link";

import { Card } from "../ui/card";
import { QuickAction } from "@/types";

interface QuickActionsProps {
  actions: QuickAction[];
}

export default function QuickActions({ actions }: QuickActionsProps) {
  return (
    <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl border border-blue-200">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Ações Rápidas</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => (
          <Link key={index} href={action.href}>
            <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer group">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                  {action.icon}
                </div>
              </div>
              <div className="font-semibold text-slate-900 mb-2">{action.title}</div>
              <div className="text-sm text-slate-600">{action.description}</div>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}