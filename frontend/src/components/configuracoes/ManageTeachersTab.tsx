import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";

interface Teacher {
    id: string;
    name: string;
    email: string;
}

interface ManageTeachersTabProps {
    teachers: Teacher[];
    filteredTeachers: Teacher[];
    selectedTeachers: string[];
    searchTerm: string;
    saving: boolean;
    loading: boolean;
    buttonSuccess: boolean;
    onSearchChange: (value: string) => void;
    onTeacherToggle: (teacherId: string) => void;
    onRemoveSelected: () => void;
}

export default function ManageTeachersTab({
    teachers,
    filteredTeachers,
    selectedTeachers,
    searchTerm,
    saving,
    loading,
    buttonSuccess,
    onSearchChange,
    onTeacherToggle,
    onRemoveSelected,
}: ManageTeachersTabProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    Gerenciar Professores
                </h3>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                        Buscar Professores
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={e => onSearchChange(e.target.value)}
                        className="w-full h-12 px-4 bg-white border-slate-300 focus:border-slate-400 focus:ring-slate-400/20 text-slate-900 placeholder:text-slate-500 rounded-xl"
                        placeholder="Busque por nome ou email..."
                    />
                </div>

                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                        <p className="text-slate-600">Carregando professores...</p>
                    </div>
                ) : teachers.length === 0 ? (
                    <div className="text-center py-8">
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-slate-600">Nenhum professor encontrado</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 mb-6">
                            {filteredTeachers.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')).map(teacher => (
                                <div key={teacher.id} className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4">
                                    <div className="flex items-start gap-4">
                                        <Checkbox
                                            variant="danger"
                                            checked={selectedTeachers.includes(teacher.id)}
                                            onChange={() => onTeacherToggle(teacher.id)}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className="font-semibold text-slate-900">{teacher.name}</span>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 mt-1 text-sm text-slate-600">
                                                <span>{teacher.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {selectedTeachers.length > 0 && (
                            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200 mb-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-800 font-semibold">
                                        {selectedTeachers.length} professor(es) selecionado(es) para remoção
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
