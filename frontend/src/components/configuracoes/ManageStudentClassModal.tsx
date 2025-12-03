import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown";

interface Student {
  id: string;
  name: string;
  email: string;
  studentRegistration?: string;
  classId?: string;
  className?: string;
}

interface Class {
  id: string;
  name: string;
}

interface ManageStudentClassModalProps {
  isOpen: boolean;
  student: Student | null;
  classes: Class[];
  onClose: () => void;
  onSave: (studentId: string, classId: string | null) => Promise<void>;
}

export default function ManageStudentClassModal({
  isOpen,
  student,
  classes,
  onClose,
  onSave,
}: ManageStudentClassModalProps) {
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (student) {
      setSelectedClassId(student.classId || null);
    }
    setError(null);
    setSaveSuccess(false);
  }, [student]);

  const handleSave = async () => {
    if (!student) return;

    setSaving(true);
    setError(null);

    try {
      await onSave(student.id, selectedClassId);
      setSaveSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar turma do estudante");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Gerenciar Turma</h2>
              <p className="text-sm text-slate-600 mt-0.5">Atribua ou remova o estudante de uma turma</p>
            </div>
          </div>
          {!saving && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-white/50"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="p-6">
          {saveSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm text-green-800 font-semibold">Turma atualizada com sucesso!</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <p className="text-xs font-medium text-slate-600 mb-1">Estudante:</p>
              <p className="font-semibold text-slate-900 text-sm">{student.name}</p>
              <p className="text-xs text-slate-600 mt-1">{student.email}</p>
              {student.studentRegistration && (
                <p className="text-xs text-slate-600 mt-1">Matrícula: {student.studentRegistration}</p>
              )}
            </div>

            <div>
              <p className="text-xs font-medium text-slate-600 mb-2">Turma Atual:</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="font-semibold text-blue-900 text-sm">
                  {student.className || "Sem turma atribuída"}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Selecionar Nova Turma:
              </label>
              <Dropdown
                value={selectedClassId || ""}
                onChange={(value) => setSelectedClassId(value || null)}
                options={[
                  { value: "", label: "Remover da turma" },
                  ...classes.map((cls) => ({
                    value: cls.id,
                    label: cls.name
                  }))
                ]}
                placeholder="Selecione uma turma"
                className="w-full"
              />
              <p className="text-xs text-slate-500 mt-2">
                Deixe em branco para remover o estudante de qualquer turma
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-800 flex-1">{error}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-slate-200">
              <button
                onClick={onClose}
                disabled={saving || saveSuccess}
                className="flex-1 h-12 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving || saveSuccess}
                className={`flex-1 h-12 px-4 text-sm font-semibold text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed ${
                  saveSuccess
                    ? "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:ring-blue-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-lg hover:shadow-xl"
                }`}
              >
                {saveSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Salvo!
                  </span>
                ) : saving ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Salvando...
                  </span>
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
