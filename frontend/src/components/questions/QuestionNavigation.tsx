import { Card } from "@/components/ui/card";
import { Question } from "@/types";

import SubmitButton from "./SubmitButton";

interface QuestionNavigationProps {
  questions: Question[];
  currentQuestionId: string;
  onQuestionChange: (questionId: string) => void;
  onSubmit: () => void;
  submitting?: boolean;
  userRole: 'student' | 'professor' | 'assistant';
}

export default function QuestionNavigation({ 
  questions, 
  currentQuestionId, 
  onQuestionChange, 
  onSubmit, 
  submitting = false,
  userRole
}: QuestionNavigationProps) {
  
  const getQuestionLetter = (index: number): string => {
    return String.fromCharCode(65 + index);
  };

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Questões</h3>
        <div className="flex gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => onQuestionChange(question.id)}
              className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                question.id === currentQuestionId
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {getQuestionLetter(index)}
            </button>
          ))}
        </div>
      </Card>

      {}
      {userRole === 'student' && (
        <Card className="p-4">
          <SubmitButton 
            onSubmit={onSubmit}
            submitting={submitting}
          />
        </Card>
      )}
    </div>
  );
}
