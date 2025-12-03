"use client";

import { ProfileData } from "../../services/profile";
import { translateUserRole, getRoleColor } from "../../utils/roleTranslations";

interface ProfileHeaderProps {
  user: ProfileData;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="bg-white border-slate-200 rounded-3xl shadow-lg p-8">
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
        <div className="relative">
          <div className={`w-32 h-32 rounded-3xl shadow-lg overflow-hidden border-4 border-white ${user.role === 'professor' ? 'bg-gradient-to-r from-purple-50 to-purple-100' :
              user.role === 'student' ? 'bg-gradient-to-r from-blue-50 to-blue-100' :
                'bg-gradient-to-r from-green-50 to-green-100'
            }`}>
            <div className={`w-full h-full flex items-center justify-center text-4xl font-bold ${user.role === 'professor' ? 'text-purple-600 bg-gradient-to-br from-purple-100 to-purple-200' :
                user.role === 'student' ? 'text-blue-600 bg-gradient-to-br from-blue-100 to-blue-200' :
                  'text-green-600 bg-gradient-to-br from-green-100 to-green-200'
              }`}>
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="text-3xl font-bold text-slate-900">{user.name || 'Usuário'}</h2>
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold ${getRoleColor(user.role).bg} ${getRoleColor(user.role).text} border ${getRoleColor(user.role).border}`}>
              {translateUserRole(user.role)}
            </span>
          </div>
          <p className="text-slate-600 text-lg mb-4">{user.email}</p>

          {user.role === 'student' && user.studentRegistration && (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
              Matrícula: {user.studentRegistration}
            </div>
          )}
        </div>

        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 text-sm text-slate-600">
          <div className="mb-3">
            <strong className="text-slate-900">Cadastrado em:</strong><br />
            {new Date(user.createdAt).toLocaleDateString('pt-BR', {
              timeZone: 'America/Sao_Paulo'
            })}
          </div>
          {user.lastLogin && (
            <div>
              <strong className="text-slate-900">Último login:</strong><br />
              {new Date(user.lastLogin).toLocaleString('pt-BR', {
                timeZone: 'America/Sao_Paulo'
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
