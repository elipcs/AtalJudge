import { Button } from "@/components/ui/button";
import { Question, Submission } from "@/types";

interface List {
  id: string;
  title: string;
  class: string;
}

interface QuestionHeaderProps {
  question: Question;
  list: List;
  bestSubmission?: Submission;
  onBack: () => void;
}

export default function QuestionHeader({ question, list, bestSubmission, onBack }: QuestionHeaderProps) {
  const getGroupColor = (group: string) => {
    const colors = {
      'A': 'text-blue-600 bg-blue-100',
      'B': 'text-green-600 bg-green-100', 
      'C': 'text-cyan-600 bg-cyan-100',
      'D': 'text-orange-600 bg-orange-100'
    };
    return colors[group as keyof typeof colors] || 'text-gray-600 bg-gray-100';
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Voltar para Lista
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{question.title}</h1>
          <p className="text-gray-600">{list.title}</p>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {question.group && (
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getGroupColor(question.group)}`}>
            Grupo {question.group}
          </span>
        )}
        <span className="text-sm text-gray-600">
          {question.points} pontos
        </span>
        {bestSubmission && (
          <span className="text-sm text-green-600 font-medium">
            ✓ Resolvida ({bestSubmission.score} pts)
          </span>
        )}
      </div>
    </div>
  );
}
