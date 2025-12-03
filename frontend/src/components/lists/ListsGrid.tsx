import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { QuestionList, Class } from "@/types";
import ListCard from "./ListCard";

interface ListsGridProps {
  lists: QuestionList[];
  userRole: string;
  onEdit: (list: QuestionList) => void;
  onDelete: (list: QuestionList) => void;
  onCreateList: () => void;
  classes: Class[];
}

export default function ListsGrid({
  lists,
  userRole,
  onEdit,
  onDelete,
  onCreateList,
  classes
}: ListsGridProps) {
  if (lists.length === 0) {
    return (
      <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-12 text-center">
        <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 text-slate-600 rounded-xl shadow-lg border border-slate-200 mx-auto mb-6 w-fit">
          <svg className="w-16 h-16 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-4">Nenhuma lista encontrada</h3>
        <p className="text-slate-600 text-lg leading-relaxed max-w-lg mx-auto mb-8">
          Tente ajustar os filtros ou criar uma nova lista.
        </p>
        {userRole !== 'student' && (
          <Button 
            onClick={onCreateList}
            className="bg-gradient-to-r from-slate-50 to-slate-100 text-slate-700 border border-slate-200 shadow-sm hover:shadow-md font-semibold transition-all duration-200 transform hover:scale-[1.02]"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Criar Primeira Lista
          </Button>
        )}
      </Card>
    );
  }

  const classIdToName = Object.fromEntries(classes.map(cls => [cls.id, cls.name]));
  return (
    <div className="grid gap-6">
      {lists.filter(list => list && list.id).map((list) => (
        <ListCard
          key={list.id}
          list={list}
          userRole={userRole}
          onEdit={onEdit}
          onDelete={onDelete}
          classNames={list.classIds?.map(cid => classIdToName[cid]).filter(Boolean) || []}
        />
      ))}
    </div>
  );
}
