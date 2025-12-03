import React from 'react';

import { QuestionList, Question, Submission } from '../../types';

interface ListQuestionsProps {
  list: QuestionList;
  onEdit: (question: Question) => void;
  onDelete: (questionId: string) => void;
  onSelect: (question: Question, index: number) => void;
  getQuestionSubmission: (questionId: string) => Submission | null;
  userRole: string;
}

export default function ListQuestions({
  list,
  onEdit,
  onDelete,
  onSelect,
  getQuestionSubmission,
  userRole
}: ListQuestionsProps) {
  if (!list || !list.questions) return null;
  return (
    <div className="bg-white/70 backdrop-blur-sm border-slate-200 shadow-lg rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Questões</h2>
      <ul className="divide-y divide-slate-200">
        {list.questions.map((question: Question, idx: number) => {
          const submission = getQuestionSubmission(question.id);
          return (
            <li key={question.id} className="py-4 flex items-center justify-between">
              <div className="flex-1 cursor-pointer" onClick={() => onSelect(question, idx)}>
                <span className="font-medium text-slate-900 mr-2">{idx + 1}.</span>
                <span className="font-medium text-blue-700 hover:underline">{question.title}</span>
                {submission && (
                  <span className={`ml-3 px-2 py-1 rounded text-xs font-medium ${
                    submission.status === 'accepted' ? 'bg-green-100 text-green-700' :
                    submission.status === 'error' ? 'bg-red-100 text-red-700' :
                    submission.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    submission.status === 'timeout' ? 'bg-orange-100 text-orange-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {submission.status === 'accepted' && 'Aceita'}
                    {submission.status === 'error' && 'Erro'}
                    {submission.status === 'pending' && 'Pendente'}
                    {submission.status === 'timeout' && 'Timeout'}
                  </span>
                )}
              </div>
              {userRole !== 'student' && (
                <div className="flex gap-2">
                  <button
                    className="px-2 py-1 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    onClick={() => onEdit(question)}
                  >Editar</button>
                  <button
                    className="px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-700"
                    onClick={() => onDelete(question.id)}
                  >Excluir</button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

