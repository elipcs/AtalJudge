"use client";

import { QuestionList } from '@/types';
import { Card } from '@/components/ui/card';
import { 
  calculateListScore, 
  formatScore, 
  getScoreColor,
  getScoreBadgeColor,
  SubmissionScore,
  FinalScore
} from '@/utils/scoringUtils';

interface ScoreSummaryProps {
  list: QuestionList;
  submissions: SubmissionScore[];
  backendScore?: FinalScore;
}

export default function ScoreSummary({ list, submissions, backendScore }: ScoreSummaryProps) {
  const scoreResult = backendScore || calculateListScore(list, submissions);
  const { mode, totalScore, maxPossibleScore, percentage, groups, questionScores } = scoreResult;

  return (
    <Card className="bg-white border-slate-200 rounded-3xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-slate-900">Sua Pontuação</h2>
        <div className={`px-6 py-3 rounded-xl text-white font-bold text-2xl shadow-lg ${getScoreBadgeColor(percentage)}`}>
          {formatScore(totalScore)} / {maxPossibleScore}
        </div>
      </div>

      {}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-600">Progresso</span>
          <span className="text-sm font-bold text-slate-700">{formatScore(percentage)}%</span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${getScoreBadgeColor(percentage)}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      {}
      {mode === 'simple' && questionScores && questionScores.length > 0 && (
        <div className="space-y-2">
          {questionScores.slice(0, list.minQuestionsForMaxScore || list.questions.length).map((score) => {
            const question = list.questions.find(q => q.id === score.questionId);
            const questionIndex = list.questions.findIndex(q => q.id === score.questionId);
            const questionLabel = questionIndex !== -1 ? String.fromCharCode(65 + questionIndex) : '?';
            const scorePercentage = (score.score / 100) * 100;
            return (
              <div key={score.questionId} className="flex items-center justify-between bg-slate-50 rounded-xl p-3 border border-slate-200">
                <div className="flex items-center gap-3 flex-1">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold text-sm">
                    {questionLabel}
                  </span>
                  <span className="text-sm text-slate-700 font-medium">
                    {question?.title || `Questão ${score.questionId.slice(0, 8)}`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(scorePercentage)}`}>
                    {score.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {}
      {mode === 'groups' && groups && groups.length > 0 && (
        <div className="space-y-3">
          {groups.map((group, index) => {
            const groupPercentage = (group.bestScore / 100) * 100;
            return (
              <div key={group.groupId} className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{group.groupName}</h4>
                      <p className="text-xs text-slate-600">
                        {group.questionsSolved}/{group.questionsInGroup} {group.questionsInGroup === 1 ? 'questão' : 'questões'}
                        {group.percentage !== undefined && ` · ${group.percentage}%`}
                      </p>
                    </div>
                  </div>
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm ${getScoreColor(groupPercentage)}`}>
                    {group.bestScore} pts
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {}
      {submissions.length === 0 && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
          <div className="p-4 bg-slate-200 rounded-xl mx-auto mb-4 w-fit">
            <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma submissão ainda</h3>
          <p className="text-slate-600">
            Resolva as questões para ver sua pontuação aqui.
          </p>
        </div>
      )}
    </Card>
  );
}
