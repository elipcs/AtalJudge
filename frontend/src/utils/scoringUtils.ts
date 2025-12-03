import { QuestionList } from '@/types';

export interface SubmissionScore {
  questionId: string;
  score: number;
  attempt: number;
}

export interface GroupScore {
  groupId: string;
  groupName: string;
  bestScore: number;
  questionsInGroup: number;
  questionsSolved: number;
  weight: number;
  percentage?: number;
}

export interface FinalScore {
  mode: 'simple' | 'groups';
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  groups?: GroupScore[];
  questionScores?: SubmissionScore[];
}

export function calculateSimpleScore(
  submissions: SubmissionScore[],
  minQuestionsForMaxScore: number,
  maxScore: number = 10
): FinalScore {
  if (!submissions || submissions.length === 0) {
    return {
      mode: 'simple',
      totalScore: 0,
      maxPossibleScore: maxScore,
      percentage: 0,
      questionScores: []
    };
  }

  const bestScoresByQuestion = new Map<string, SubmissionScore>();
  
  submissions.forEach(sub => {
    const existing = bestScoresByQuestion.get(sub.questionId);
    if (!existing || sub.score > existing.score) {
      bestScoresByQuestion.set(sub.questionId, sub);
    }
  });

  const sortedScores = Array.from(bestScoresByQuestion.values())
    .sort((a, b) => b.score - a.score);

  const topScores = sortedScores.slice(0, minQuestionsForMaxScore);

  const totalPoints = topScores.reduce((sum, score) => sum + score.score, 0);
  const averageScore = topScores.length > 0 ? totalPoints / topScores.length : 0;
  
  const finalScore = (averageScore / 100) * maxScore;
  const percentage = (finalScore / maxScore) * 100;

  return {
    mode: 'simple',
    totalScore: finalScore,
    maxPossibleScore: maxScore,
    percentage,
    questionScores: sortedScores
  };
}

export function calculateGroupScore(
  submissions: SubmissionScore[],
  questionGroups: Array<{
    id: string;
    name: string;
    questionIds: string[];
    weight: number;
    percentage?: number;
  }>,
  maxScore: number = 10
): FinalScore {
  if (!submissions || submissions.length === 0) {
    return {
      mode: 'groups',
      totalScore: 0,
      maxPossibleScore: maxScore,
      percentage: 0,
      groups: questionGroups.map(group => {
        if (!group || !group.questionIds) {
          return {
            groupId: group?.id || 'unknown',
            groupName: group?.name || 'Grupo sem nome',
            bestScore: 0,
            questionsInGroup: 0,
            questionsSolved: 0,
            weight: group?.weight || 1,
            percentage: group?.percentage
          };
        }
        const questionIds = Array.isArray(group.questionIds) ? group.questionIds : [];
        return {
          groupId: group.id,
          groupName: group.name,
          bestScore: 0,
          questionsInGroup: questionIds.length,
          questionsSolved: 0,
          weight: group.weight,
          percentage: group.percentage
        };
      })
    };
  }

  const bestScoresByQuestion = new Map<string, SubmissionScore>();
  
  submissions.forEach(sub => {
    const existing = bestScoresByQuestion.get(sub.questionId);
    if (!existing || sub.score > existing.score) {
      bestScoresByQuestion.set(sub.questionId, sub);
    }
  });

  const groupScores: GroupScore[] = questionGroups.map(group => {
    if (!group || !group.questionIds) {
      return {
        groupId: group?.id || 'unknown',
        groupName: group?.name || 'Grupo sem nome',
        bestScore: 0,
        questionsInGroup: 0,
        questionsSolved: 0,
        weight: group?.weight || 1,
        percentage: group?.percentage
      };
    }
    const questionsInGroup = Array.isArray(group.questionIds) ? group.questionIds : [];
    const scoresInGroup = questionsInGroup
      .map(qId => bestScoresByQuestion.get(qId))
      .filter((score): score is SubmissionScore => score !== undefined);

    const bestScore = scoresInGroup.length > 0
      ? Math.max(...scoresInGroup.map(s => s.score))
      : 0;

    return {
      groupId: group.id,
      groupName: group.name,
      bestScore,
      questionsInGroup: questionsInGroup.length,
      questionsSolved: scoresInGroup.length,
      weight: group.weight,
      percentage: group.percentage
    };
  });

  const usePercentages = questionGroups.every(g => g.percentage !== undefined);
  
  let finalScore: number;
  
  if (usePercentages) {
    const percentageSum = groupScores.reduce((sum, groupScore) => {
      const percentage = groupScore.percentage || 0;
      const normalizedScore = groupScore.bestScore / 100;
      return sum + (normalizedScore * percentage);
    }, 0);
    
    finalScore = (percentageSum / 100) * maxScore;
  } else {
    const totalWeight = questionGroups.reduce((sum, g) => sum + g.weight, 0);
    const weightedSum = groupScores.reduce((sum, groupScore) => {
      const normalizedScore = groupScore.bestScore / 100;
      return sum + (normalizedScore * groupScore.weight);
    }, 0);
    
    finalScore = totalWeight > 0 
      ? (weightedSum / totalWeight) * maxScore 
      : 0;
  }
  
  const percentage = (finalScore / maxScore) * 100;

  return {
    mode: 'groups',
    totalScore: finalScore,
    maxPossibleScore: maxScore,
    percentage,
    groups: groupScores
  };
}

export function calculateListScore(
  list: QuestionList,
  submissions: SubmissionScore[]
): FinalScore {
  const scoringMode = list.scoringMode || 'simple';
  const maxScore = list.maxScore || 10;

  if (scoringMode === 'groups' && list.questionGroups && list.questionGroups.length > 0) {
    return calculateGroupScore(submissions, list.questionGroups, maxScore);
  }

  const minQuestionsForMaxScore = list.minQuestionsForMaxScore || list.questions.length;
  return calculateSimpleScore(submissions, minQuestionsForMaxScore, maxScore);
}

export function formatScore(score: number, decimals: number = 1): string {
  return score.toFixed(decimals);
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600 bg-green-50';
  if (percentage >= 70) return 'text-blue-600 bg-blue-50';
  if (percentage >= 50) return 'text-yellow-600 bg-yellow-50';
  if (percentage >= 30) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
}

export function getScoreBadgeColor(percentage: number): string {
  if (percentage >= 90) return 'bg-gradient-to-r from-green-500 to-green-600';
  if (percentage >= 70) return 'bg-gradient-to-r from-blue-500 to-blue-600';
  if (percentage >= 50) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
  if (percentage >= 30) return 'bg-gradient-to-r from-orange-500 to-orange-600';
  return 'bg-gradient-to-r from-red-500 to-red-600';
}
