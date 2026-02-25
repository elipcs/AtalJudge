import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { useState } from "react";


interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration?: string;
  classId?: string;
  className?: string;
  submissionsCount?: number;
}

interface ManageStudentsTabProps {
  students: Student[];
  filteredStudents: Student[];
  selectedStudents: string[];
  searchTerm: string;
  saving: boolean;
  loading: boolean;
  buttonSuccess: boolean;
  onSearchChange: (value: string) => void;
  onStudentToggle: (studentId: string) => void;
  onRemoveSelected: () => void;
  onManageClass?: (student: Student) => void;
  onGenerateResetLink?: (userId: string) => Promise<string | null>;
}

export default function ManageStudentsTab({
  students,
  filteredStudents,
  selectedStudents,
  searchTerm,
  saving,
  loading,
  buttonSuccess,
  onSearchChange,
  onStudentToggle,
  onRemoveSelected,
  onManageClass,
  onGenerateResetLink,
}: ManageStudentsTabProps) {
  const [generatedLink, setGeneratedLink] = useState<{ userId: string; link: string } | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerateLink = async (userId: string) => {
    if (!onGenerateResetLink) return;

    setIsGenerating(userId);
    const link = await onGenerateResetLink(userId);
    if (link) {
      setGeneratedLink({ userId, link });
    }
    setIsGenerating(null);
  };
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Gerenciar Estudantes
        </h3>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-900 mb-2">
            Buscar Estudantes
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
            placeholder="Busque por nome, email, matrícula ou turma..."
          />
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando estudantes...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-600">Nenhum estudante encontrado</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-6">
              {filteredStudents.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(student => (
                <div key={student.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                  <div className="flex items-start gap-4">
                    <Checkbox
                      variant="danger"
                      checked={selectedStudents.includes(student.id)}
                      onChange={() => onStudentToggle(student.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-900">{student.name}</span>
                          <span className="ml-3 text-sm text-slate-600">({student.studentRegistration})</span>
                        </div>
                      </div>
                      <div className="flex gap-4 mt-1 text-sm text-slate-600">
                        <span>{student.email}</span>
                        <span>•</span>
                        <span>Turma: {student.className || 'Sem turma'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => onManageClass?.(student)}
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-blue-300 text-blue-700 hover:bg-blue-50"
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        Gerenciar Turma
                      </Button>

                      <Button
                        onClick={() => handleGenerateLink(student.id)}
                        disabled={isGenerating === student.id}
                        variant="outline"
                        size="sm"
                        className="shrink-0 border-amber-300 text-amber-700 hover:bg-amber-50"
                      >
                        {isGenerating === student.id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1"></div>
                        ) : (
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        )}
                        Gerar Link de Recuperação
                      </Button>
                    </div>
                  </div>

                  {generatedLink?.userId === student.id && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <p className="text-sm font-semibold text-amber-900 mb-2">Link de recuperação gerado:</p>
                      <div className="flex gap-2">
                        <input
                          readOnly
                          value={generatedLink.link}
                          className="flex-1 text-xs p-2 bg-white border border-amber-300 rounded-lg text-slate-700"
                        />
                        <Button
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(generatedLink.link);
                            alert('Link copiado para a área de transferência!');
                          }}
                        >
                          Copiar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setGeneratedLink(null)}
                        >
                          Fechar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedStudents.length > 0 && (
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-semibold">
                    {selectedStudents.length} estudante(s) selecionado(s) para remoção
                  </span>
                  <Button
                    onClick={onRemoveSelected}
                    disabled={saving}
                    variant={buttonSuccess ? "default" : "secondary"}
                    size="default"
                    className="gap-3"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                        Removendo...
                      </>
                    ) : buttonSuccess ? (
                      <>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Removidos!
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Remover Selecionados
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
