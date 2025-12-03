"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

import { useUserRole } from "../hooks/useUserRole";
import { UserRole } from "../types";

import LogoutButton from "./LogoutButton";

interface NavigationBarProps {
  currentPage?: string;
}

interface NavigationLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  key: string;
  roles: UserRole[];
}

export default function NavigationBar({ currentPage }: NavigationBarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('sidebar-collapsed') === 'true';
  });
  const { userRole, isLoading } = useUserRole();

  useEffect(() => {
    document.documentElement.style.setProperty(
      '--sidebar-width',
      isCollapsed ? '4rem' : '16rem'
    );
  }, [isCollapsed]);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', newState.toString());

    document.documentElement.style.setProperty(
      '--sidebar-width',
      newState ? '4rem' : '16rem'
    );
  };

  const allNavigationLinks: NavigationLink[] = [
    {
      href: "/home",
      label: "Home",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      key: "home",
      roles: ['professor', 'student', 'assistant']
    },
    {
      href: "/listas",
      label: "Listas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      key: "listas",
      roles: ['professor', 'student', 'assistant']
    },
    {
      href: "/questoes",
      label: "Questões",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      key: "questoes",
      roles: ['professor', 'assistant']
    },
    {
      href: "/turmas",
      label: "Turmas",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      key: "turmas",
      roles: ['professor', 'student', 'assistant']
    },
    {
      href: "/submissoes",
      label: "Submissões",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      key: "submissoes",
      roles: ['professor', 'student', 'assistant']
    },
    {
      href: "/convites",
      label: "Convites",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      key: "convites",
      roles: ['professor']
    },
    {
      href: "/perfil",
      label: "Perfil",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      key: "perfil",
      roles: ['professor', 'student', 'assistant']
    },
    {
      href: "/configuracoes",
      label: "Configurações",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      key: "configuracoes",
      roles: ['professor']
    },
    {
      href: "/ajuda",
      label: "Ajuda",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      key: "ajuda",
      roles: ['professor', 'student', 'assistant']
    }
  ];

  const getLinksForUserRole = (): NavigationLink[] => {
    return allNavigationLinks.filter(link => link.roles.includes(userRole));
  };

  const links = getLinksForUserRole();

  const getCurrentKey = () => {
    if (currentPage) return currentPage;
    if (pathname === "/home") return "home";
    if (pathname === "/perfil") return "perfil";
    if (pathname.includes("/turmas")) return "turmas";
    if (pathname.includes("/convites")) return "convites";
    if (pathname.includes("/configuracoes")) return "configuracoes";
    if (pathname.includes("/listas")) return "listas";
    if (pathname.includes("/submissoes")) return "submissoes";
    if (pathname.includes("/questoes")) return "questoes";
    if (pathname.includes("/ajuda")) return "ajuda";
    return "";
  };

  const activeKey = getCurrentKey();

  if (isLoading) {
    return (
      <nav className={`h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'w-16' : 'w-64'
        }`}>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </nav>
    );
  }

  return (
    <>
      { }
      <style jsx global>{`
        :root {
          --sidebar-width: ${isCollapsed ? '4rem' : '16rem'};
        }
      `}</style>
      { }
      <nav className={`h-full bg-gradient-to-b from-slate-50 to-white border-r border-slate-200 shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'w-16' : 'w-64'
        }`}>
        <div className={`transition-all duration-300 ease-in-out ${isCollapsed ? 'p-2' : 'p-4'}`}>
          { }
          <div className={`mb-6 transition-all duration-300 ease-in-out ${isCollapsed ? 'space-y-2' : 'flex items-center justify-between'}`}>
            { }
            <div className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'justify-center' : 'justify-start'}`}>
              <Link href="/home" className="flex-shrink-0 hover:opacity-80 transition-opacity duration-200">
                {isCollapsed ? (
                  <div className="transition-all duration-300 ease-in-out cursor-pointer w-10 h-10 flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl mx-auto shadow-lg hover:shadow-xl" title="Ir para página inicial">
                    <svg
                      className="w-6 h-6 transition-transform duration-200 hover:scale-110"
                      fill="white"
                      stroke="none"
                      viewBox="0 0 500 500"
                    >
                      <g transform="translate(0,500) scale(0.1,-0.1)">
                        <path d="M2486 4613 c-39 -10 -93 -53 -195 -154 -115 -115 -140 -158 -141 -238 0 -85 25 -124 173 -266 73 -70 195 -188 272 -263 77 -76 199 -193 270 -261 72 -69 186 -179 255 -246 145 -141 181 -160 282 -153 37 2 79 12 101 23 50 27 261 238 283 284 25 52 23 126 -5 183 -25 49 -142 167 -591 598 -134 129 -293 282 -353 340 -128 124 -191 161 -277 159 -30 -1 -64 -4 -74 -6z" />
                        <path d="M1784 3414 c-225 -229 -410 -421 -412 -428 -1 -6 170 -183 380 -393 442 -441 434 -433 455 -433 17 0 826 799 845 834 10 18 -12 42 -183 209 -107 104 -294 288 -415 408 -137 136 -229 219 -241 219 -13 0 -166 -148 -429 -416z" />
                        <path d="M1004 2909 c-40 -15 -74 -43 -160 -132 -117 -119 -134 -150 -134 -239 0 -93 22 -119 482 -579 396 -395 434 -430 486 -449 67 -25 135 -24 197 5 54 25 248 219 269 269 22 53 21 147 -3 194 -16 32 -177 193 -831 833 -122 119 -192 142 -306 98z" />
                        <path d="M2760 2478 c-83 -84 -150 -155 -150 -158 0 -5 7 -13 194 -215 61 -66 134 -145 161 -175 28 -30 80 -86 116 -125 36 -38 86 -92 111 -120 24 -27 105 -115 179 -195 74 -80 175 -190 224 -245 50 -54 119 -131 155 -170 36 -38 112 -122 170 -185 247 -271 300 -310 431 -318 67 -4 84 -1 134 22 66 30 193 148 233 216 24 40 27 55 27 140 0 147 -1 148 -386 481 -138 120 -350 301 -459 393 -14 11 -55 46 -90 77 -75 64 -88 75 -191 161 -251 209 -516 432 -590 495 -47 40 -93 73 -103 73 -9 0 -84 -68 -166 -152z" />
                        <path d="M780 1182 c-19 -9 -45 -32 -57 -51 -20 -30 -23 -47 -23 -132 l0 -99 -70 0 c-87 0 -129 -17 -166 -66 -28 -36 -29 -42 -32 -163 -2 -116 -1 -129 20 -165 13 -21 39 -47 58 -57 33 -18 82 -19 1125 -19 1070 0 1091 0 1123 20 61 37 72 70 72 210 0 193 -29 232 -176 239 l-84 3 0 92 c0 113 -17 151 -80 184 l-44 22 -816 0 c-756 0 -818 -1 -850 -18z" />
                      </g>
                    </svg>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                      <svg
                        className="w-8 h-8 text-white transition-transform duration-200 hover:scale-110"
                        fill="white"
                        stroke="none"
                        viewBox="0 0 500 500"
                      >
                        <g transform="translate(0,500) scale(0.1,-0.1)">
                          <path d="M2486 4613 c-39 -10 -93 -53 -195 -154 -115 -115 -140 -158 -141 -238 0 -85 25 -124 173 -266 73 -70 195 -188 272 -263 77 -76 199 -193 270 -261 72 -69 186 -179 255 -246 145 -141 181 -160 282 -153 37 2 79 12 101 23 50 27 261 238 283 284 25 52 23 126 -5 183 -25 49 -142 167 -591 598 -134 129 -293 282 -353 340 -128 124 -191 161 -277 159 -30 -1 -64 -4 -74 -6z" />
                          <path d="M1784 3414 c-225 -229 -410 -421 -412 -428 -1 -6 170 -183 380 -393 442 -441 434 -433 455 -433 17 0 826 799 845 834 10 18 -12 42 -183 209 -107 104 -294 288 -415 408 -137 136 -229 219 -241 219 -13 0 -166 -148 -429 -416z" />
                          <path d="M1004 2909 c-40 -15 -74 -43 -160 -132 -117 -119 -134 -150 -134 -239 0 -93 22 -119 482 -579 396 -395 434 -430 486 -449 67 -25 135 -24 197 5 54 25 248 219 269 269 22 53 21 147 -3 194 -16 32 -177 193 -831 833 -122 119 -192 142 -306 98z" />
                          <path d="M2760 2478 c-83 -84 -150 -155 -150 -158 0 -5 7 -13 194 -215 61 -66 134 -145 161 -175 28 -30 80 -86 116 -125 36 -38 86 -92 111 -120 24 -27 105 -115 179 -195 74 -80 175 -190 224 -245 50 -54 119 -131 155 -170 36 -38 112 -122 170 -185 247 -271 300 -310 431 -318 67 -4 84 -1 134 22 66 30 193 148 233 216 24 40 27 55 27 140 0 147 -1 148 -386 481 -138 120 -350 301 -459 393 -14 11 -55 46 -90 77 -75 64 -88 75 -191 161 -251 209 -516 432 -590 495 -47 40 -93 73 -103 73 -9 0 -84 -68 -166 -152z" />
                          <path d="M780 1182 c-19 -9 -45 -32 -57 -51 -20 -30 -23 -47 -23 -132 l0 -99 -70 0 c-87 0 -129 -17 -166 -66 -28 -36 -29 -42 -32 -163 -2 -116 -1 -129 20 -165 13 -21 39 -47 58 -57 33 -18 82 -19 1125 -19 1070 0 1091 0 1123 20 61 37 72 70 72 210 0 193 -29 232 -176 239 l-84 3 0 92 c0 113 -17 151 -80 184 l-44 22 -816 0 c-756 0 -818 -1 -850 -18z" />
                        </g>
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        AtalJudge
                      </h1>
                      <p className="text-xs text-slate-500">Sistema de Avaliação</p>
                    </div>
                  </div>
                )}
              </Link>
            </div>

            <div className={`flex justify-center ${isCollapsed ? '' : 'justify-end'}`}>
              <button
                onClick={toggleCollapse}
                className={`hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0 ${isCollapsed ? 'w-12 h-12 flex items-center justify-center' : 'p-2'}`}
                title={isCollapsed ? "Expandir menu" : "Retrair menu"}
              >
                <svg
                  className={`w-5 h-5 text-slate-600 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''
                    }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {links.map((link) => {
              const isActive = activeKey === link.key;
              return (
                <div key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex ${isCollapsed ? 'justify-center items-center' : 'items-center gap-3'} text-sm font-medium rounded-xl transition-all duration-300 ease-in-out relative group ${isActive
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      } ${isCollapsed ? 'w-12 h-12' : 'px-4 py-3'}`}
                    title={isCollapsed ? link.label : undefined}
                  >
                    <span className={`${isActive ? "text-blue-600" : "text-slate-400"} flex-shrink-0 transition-colors duration-300 ease-in-out ${isCollapsed ? 'mx-auto' : ''}`}>
                      {link.icon}
                    </span>
                    <span className={`truncate transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100 w-auto'
                      }`}>
                      {link.label}
                    </span>
                    { }
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                        {link.label}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          <div className={`mt-8 pt-4 border-t border-slate-200 transition-all duration-300 ${isCollapsed ? 'mt-4 pt-2' : 'mt-8 pt-4'
            }`}>
            <LogoutButton isCollapsed={isCollapsed} />
          </div>
        </div>
      </nav>
    </>
  );
}