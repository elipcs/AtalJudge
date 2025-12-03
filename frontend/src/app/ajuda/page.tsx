"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { User, BookOpen, Users, ArrowRight } from "lucide-react";

export default function AjudaPage() {
  const helpItems = [
    {
      title: "Alunos",
      description: "Como acessar listas e submeter suas soluções",
      href: "/ajuda/alunos",
      icon: User,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      iconBgColor: "bg-blue-100",
      iconColor: "text-blue-600"
    },
    {
      title: "Monitores",
      description: "Como criar questões, listas e acompanhar as submissões dos alunos",
      href: "/ajuda/monitores",
      icon: Users,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      iconBgColor: "bg-green-100",
      iconColor: "text-green-600"
    },
    {
      title: "Professores",
      description: "Como gerenciar turmas, criar convites e gerenciar o sistema",
      href: "/ajuda/professores",
      icon: BookOpen,
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      iconBgColor: "bg-purple-100",
      iconColor: "text-purple-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-6">
        <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Centro de Ajuda
          </h1>
          <p className="text-slate-600 text-lg">Guias e documentação para usar a plataforma</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Help Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {helpItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href}>
                <Card className={`h-full p-6 border-2 ${item.borderColor} ${item.bgColor} hover:shadow-lg transition-all duration-200 cursor-pointer group rounded-3xl`}>
                  <div className="flex flex-col h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 ${item.iconBgColor} rounded-xl`}>
                        <Icon className={`${item.iconColor} w-6 h-6`} />
                      </div>
                      <ArrowRight className="text-slate-300 group-hover:text-slate-400 transition-colors w-5 h-5" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">
                      {item.title}
                    </h2>
                    <p className="text-slate-600 text-sm flex-1">
                      {item.description}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

      </div>
    </div>
  );
}
