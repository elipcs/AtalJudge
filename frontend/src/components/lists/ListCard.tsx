import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionList } from "@/types";
import { formatDateTime, createBrazilianDate } from "@/utils";

interface ListCardProps {
  list: QuestionList;
  userRole: string;
  onEdit: (list: QuestionList) => void;
  onDelete: (list: QuestionList) => void;
  classNames?: string[];
}

export default function ListCard({
  list,
  userRole,
  onEdit,
  onDelete,
  classNames = []
}: ListCardProps) {
  if (!list || !list.id) {
    return null;
  }

  const now = new Date();
  const startDate = createBrazilianDate(list.startDate);
  const endDate = createBrazilianDate(list.endDate);
  const hasStarted = startDate && now >= startDate;
  const notEnded = endDate ? now < endDate : true;
  const isOngoing = hasStarted && notEnded;
  const isClosed = list.calculatedStatus === 'closed' || (!!endDate && now >= endDate);

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <Link href={`/listas/${list.id}`} className="block">
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                {list.title}
                {isOngoing && (
                  <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold align-middle">Em andamento</span>
                )}
              </h3>
              {list.description && (
                <p className="text-slate-600 text-lg">{list.description}</p>
              )}
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="font-semibold text-slate-900">{list.questionCount || list.questions?.length || 0} questões</span>
                </span>
                <span className="flex items-center gap-2 text-slate-600">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-slate-900">
                    {formatDateTime(list.startDate)} - {formatDateTime(list.endDate)}
                  </span>
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-500">
              Criada em {formatDateTime(list.createdAt)} | Última atualização em {formatDateTime(list.updatedAt)}
              {classNames.length > 0 && (
                <>
                  {' '}| Turmas: <span className="font-semibold text-slate-700">{classNames.join(', ')}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3">
            {}
            <div className="flex gap-2">
              {userRole === 'student' ? (
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => handleActionClick(e, () => {
                    window.location.href = `/listas/${list.id}`;
                  })}
                  className="border-blue-300 text-blue-700 hover:bg-blue-50 font-semibold transition-all duration-200 rounded-xl"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Acessar
                </Button>
              ) : (
                
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      if (isClosed) {
                        e.preventDefault();
                        e.stopPropagation();
                        return;
                      }
                      handleActionClick(e, () => onEdit(list));
                    }}
                    disabled={isClosed}
                    className={`border-slate-300 text-slate-700 font-semibold transition-all duration-200 rounded-xl ${
                      isClosed 
                        ? 'opacity-50 cursor-not-allowed bg-slate-100' 
                        : 'hover:bg-slate-50'
                    }`}
                    title={isClosed ? 'Esta lista está fechada e não pode ser editada' : 'Editar lista'}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </Button>

                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => handleActionClick(e, () => onDelete(list))}
                    className="border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold transition-all duration-200 rounded-xl"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Deletar
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
