"use client";

import React, { useMemo, memo } from "react";

import { Card } from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { useStaffHomeData } from "../../hooks/useHomeData";
import { User } from "@/types";
import { getCurrentDateFormatted } from "../../utils";

import SubmissionsTable from "./SubmissionsTable";
import ListsComponent from "./ListsComponent";
import SystemNotices from "./SystemNotices";

import { WelcomeHeader, UserActions } from "./index";

interface StaffHomeProps {
  currentUser: User;
  userRole: 'professor' | 'assistant';
}

const StaffHome = memo(({ currentUser, userRole }: StaffHomeProps) => {
  const { data } = useStaffHomeData();
  
  const currentDate = useMemo(() => getCurrentDateFormatted(), []);
  
  const submissions = data?.submissions || [];

  const isProfessor = userRole === 'professor';
  const title = isProfessor 
    ? `Bem-vindo(a), Prof. ${currentUser.name.split(' ')[0]}!`
    : `Bem-vindo(a), Monitor ${currentUser.name.split(' ')[0]}!`;

  return (
    <div className="space-y-6">
      <WelcomeHeader
        currentUser={currentUser}
        title={title}
      >
        <div className="flex items-center gap-2 mt-1 text-slate-600 text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{currentDate}</span>
        </div>
      </WelcomeHeader>

      <UserActions userRole={userRole} />

      <Card className="p-6 bg-white border-slate-200 rounded-3xl shadow-lg">
        <Tabs defaultValue="submissoes">
          <TabsList className={`grid w-full ${isProfessor ? 'grid-cols-3' : 'grid-cols-2'} bg-slate-100 rounded-xl p-1`}>
            <TabsTrigger 
              value="submissoes" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 font-medium"
            >
              Submissões Recentes
            </TabsTrigger>
            <TabsTrigger 
              value="listas" 
              className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 font-medium"
            >
              Listas Ativas
            </TabsTrigger>
            {isProfessor && (
              <TabsTrigger 
                value="avisos" 
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-600 font-medium"
              >
                Avisos do Sistema
              </TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="submissoes" className="mt-6">
            <SubmissionsTable submissions={submissions} showActions={true} />
          </TabsContent>
          <TabsContent value="listas" className="mt-6">
            <ListsComponent />
          </TabsContent>
          {isProfessor && (
            <TabsContent value="avisos" className="mt-6">
              <SystemNotices />
            </TabsContent>
          )}
        </Tabs>
      </Card>
    </div>
  );
});

StaffHome.displayName = 'StaffHome';

export default StaffHome;
