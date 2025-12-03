"use client";

import { useState, useEffect } from 'react';
import { QuestionList } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { logger } from '@/utils/logger';

interface ScoreSystemConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  list: QuestionList;
  onSave: (config: {
    scoringMode: 'simple' | 'groups';
    minQuestionsForMaxScore?: number;
    maxScore: number;
    questionGroups?: Array<{
      id: string;
      name: string;
      questionIds: string[];
      weight: number;
      percentage?: number;
    }>;
  }) => void;
}

export default function ScoreSystemConfigModal({ 
  isOpen, 
  onClose, 
  list,
  onSave 
}: ScoreSystemConfigModalProps) {
  const [scoringMode, setScoringMode] = useState<'simple' | 'groups'>(list.scoringMode || 'simple');
  const [minQuestionsForMaxScore, setMinQuestionsForMaxScore] = useState(
    list.minQuestionsForMaxScore || list.questions.length
  );
  const [maxScore, setMaxScore] = useState(list.maxScore || 10);
  const [questionGroups, setQuestionGroups] = useState<Array<{
    id: string;
    name: string;
    questionIds: string[];
    weight: number;
    percentage?: number;
  }>>(list.questionGroups || []);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    groups: '',
    percentage: ''
  });

  useEffect(() => {
    if (isOpen) {
      setScoringMode(list.scoringMode || 'simple');
      setMinQuestionsForMaxScore(list.minQuestionsForMaxScore || list.questions.length);
      setMaxScore(list.maxScore || 10);
      const normalizedGroups = (list.questionGroups || []).map(group => ({
        ...group,
        questionIds: Array.isArray(group.questionIds) ? group.questionIds : []
      }));
      
      setQuestionGroups(normalizedGroups);
      setErrors({ groups: '', percentage: '' });
    }
  }, [isOpen, list]);

  const handleAddGroup = () => {
    const usedQuestionIds = new Set(questionGroups.flatMap(g => {
      if (!g || !g.questionIds) return [];
      return Array.isArray(g.questionIds) ? g.questionIds : [];
    }));
    const availableQuestions = list.questions.filter(q => !usedQuestionIds.has(q.id));
    
    if (availableQuestions.length === 0) {
      return;
    }

    const newGroup = {
      id: Date.now().toString(),
      name: `Grupo ${questionGroups.length + 1}`,
      questionIds: [],
      weight: 1,
      percentage: 0
    };
    
    const updatedGroups = [...questionGroups, newGroup];
    
    const equalPercentage = 100 / updatedGroups.length;
    const groupsWithEqualPercentages = updatedGroups.map(g => ({
      ...g,
      percentage: equalPercentage
    }));
    
    setQuestionGroups(groupsWithEqualPercentages);
  };

  const handleRemoveGroup = (groupId: string) => {
    const remainingGroups = questionGroups.filter(g => g.id !== groupId);
    
    if (remainingGroups.length > 0) {
      const equalPercentage = 100 / remainingGroups.length;
      const groupsWithEqualPercentages = remainingGroups.map(g => ({
        ...g,
        percentage: equalPercentage
      }));
      setQuestionGroups(groupsWithEqualPercentages);
    } else {
      setQuestionGroups([]);
    }
  };

  const isDuplicateGroupName = (groupId: string, name: string) => {
    const trimmedName = name.trim().toLowerCase();
    if (!trimmedName) return false;
    
    return questionGroups.some(g => 
      g.id !== groupId && 
      g.name.trim().toLowerCase() === trimmedName
    );
  };

  const handleGroupChange = (
    groupId: string, 
    field: 'name' | 'weight' | 'percentage', 
    value: string | number
  ) => {
    setQuestionGroups(questionGroups.map(g => 
      g.id === groupId 
        ? { ...g, [field]: field === 'name' ? value : Number(value) }
        : g
    ));
  };

  const handleQuestionToggle = (groupId: string, questionId: string) => {
    setQuestionGroups(questionGroups.map(g => {
      if (g.id === groupId) {
        if (!g || !g.questionIds) {
          return { ...g, questionIds: [questionId] };
        }
        const currentQuestionIds = Array.isArray(g.questionIds) ? g.questionIds : [];
        const questionIds = currentQuestionIds.includes(questionId)
          ? currentQuestionIds.filter(id => id !== questionId)
          : [...currentQuestionIds, questionId];
        return { ...g, questionIds };
      }
      return g;
    }));
  };

  const validateConfiguration = () => {
    const newErrors = {
      groups: '',
      percentage: ''
    };

    if (scoringMode === 'groups') {
      const groupNames = questionGroups.map(g => g.name.trim().toLowerCase()).filter(name => name !== '');
      const duplicateNames = groupNames.filter((name, index) => groupNames.indexOf(name) !== index);
      if (duplicateNames.length > 0) {
        newErrors.groups = 'Os grupos não podem ter nomes iguais';
      }

      const emptyGroups = questionGroups.filter(g => {
        if (!g || !g.questionIds) return true;
        return !Array.isArray(g.questionIds) || g.questionIds.length === 0;
      });
      if (emptyGroups.length > 0 && !newErrors.groups) {
        newErrors.groups = 'Todos os grupos devem ter pelo menos uma questão';
      }

      const assignedQuestionIds = new Set(questionGroups.flatMap(g => {
        if (!g || !g.questionIds) return [];
        return Array.isArray(g.questionIds) ? g.questionIds : [];
      }));
      const unassignedQuestions = list.questions.filter(q => !assignedQuestionIds.has(q.id));
      if (unassignedQuestions.length > 0 && !newErrors.groups) {
        newErrors.groups = `${unassignedQuestions.length === 1 ? 'Esta questão deve estar' : 'Todas as questões devem estar'} em algum grupo`;
      }

      const totalPercentage = questionGroups.reduce((sum, g) => sum + (g.percentage || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        newErrors.percentage = `A soma das porcentagens deve ser 100%. Atualmente: ${totalPercentage.toFixed(1)}%`;
      }
    }

    setErrors(newErrors);
    return !newErrors.groups && !newErrors.percentage;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateConfiguration()) {
      return;
    }

    try {
      setLoading(true);
      await onSave({
        scoringMode,
        minQuestionsForMaxScore: scoringMode === 'simple' ? minQuestionsForMaxScore : undefined,
        maxScore,
        questionGroups: scoringMode === 'groups' ? questionGroups : undefined
      });
      onClose();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const totalPercentage = questionGroups.reduce((sum, g) => sum + (g.percentage || 0), 0);
  const usedQuestionIds = new Set(questionGroups.flatMap(g => {
    if (!g || !g.questionIds) return [];
    return Array.isArray(g.questionIds) ? g.questionIds : [];
  }));
  const unassignedQuestions = list.questions.filter(q => !usedQuestionIds.has(q.id));

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-4xl mx-4 my-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 rounded-xl">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Configurar Sistema de Pontuação</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nota Máxima
            </label>
            <Input
              type="number"
              min="1"
              max="100"
              step="0.1"
              value={maxScore}
              onChange={(e) => setMaxScore(Number(e.target.value))}
              disabled={loading}
              className="h-12 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Modo de Pontuação
            </label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setScoringMode('simple')}
                disabled={loading}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  scoringMode === 'simple'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    scoringMode === 'simple' ? 'border-blue-500' : 'border-slate-300'
                  }`}>
                    {scoringMode === 'simple' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900">Modo Simples</h3>
                </div>
                <p className="text-sm text-slate-600 ml-8">
                  Média das melhores questões resolvidas
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScoringMode('groups')}
                disabled={loading}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  scoringMode === 'groups'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    scoringMode === 'groups' ? 'border-blue-500' : 'border-slate-300'
                  }`}>
                    {scoringMode === 'groups' && (
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                    )}
                  </div>
                  <h3 className="font-bold text-slate-900">Modo por Grupos</h3>
                </div>
                <p className="text-sm text-slate-600 ml-8">
                  Nota calculada com base nas porcentagens de cada grupo
                </p>
              </button>
            </div>
          </div>

          {scoringMode === 'simple' && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <label className="block text-sm font-medium text-blue-900 mb-2">
                Número mínimo de questões para nota máxima
              </label>
              <Input
                type="number"
                min="1"
                max={list.questions.length}
                value={minQuestionsForMaxScore}
                onChange={(e) => setMinQuestionsForMaxScore(Number(e.target.value))}
                disabled={loading}
                className="h-12 text-sm bg-white border-blue-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 rounded-xl"
              />
              <p className="text-xs text-blue-700 mt-2">
                A nota será a média {minQuestionsForMaxScore === 1 
                  ? 'da melhor questão resolvida' 
                  : `das ${minQuestionsForMaxScore} melhores questões resolvidas`}
              </p>
            </div>
          )}

          {scoringMode === 'groups' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-slate-700">Grupos de Questões</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Total: {totalPercentage.toFixed(1)}% de 100%
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddGroup}
                  disabled={loading || unassignedQuestions.length === 0}
                  className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg"
                >
                  + Adicionar Grupo
                </Button>
              </div>

              {errors.groups && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{errors.groups}</p>
                </div>
              )}

              {errors.percentage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-600">{errors.percentage}</p>
                </div>
              )}

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {questionGroups.map((group) => (
                  <div key={group.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Nome do Grupo
                          </label>
                          <Input
                            type="text"
                            value={group.name}
                            onChange={(e) => handleGroupChange(group.id, 'name', e.target.value)}
                            disabled={loading}
                            placeholder="Nome do grupo"
                            className={`h-10 text-sm bg-white text-slate-900 rounded-lg ${
                              isDuplicateGroupName(group.id, group.name)
                                ? 'border-red-400 focus:border-red-500 focus:ring-red-400/20'
                                : 'border-slate-200 focus:border-blue-400 focus:ring-blue-400/20'
                            }`}
                          />
                          {isDuplicateGroupName(group.id, group.name) && (
                            <p className="text-xs text-red-600 mt-1">Nome duplicado</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Porcentagem (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={group.percentage || 0}
                            onChange={(e) => handleGroupChange(group.id, 'percentage', e.target.value)}
                            disabled={loading}
                            className="h-10 text-sm bg-white border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 text-slate-900 rounded-lg"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveGroup(group.id)}
                        disabled={loading}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-5"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-2">
                        {(Array.isArray(group.questionIds) ? group.questionIds.length : 0) === 1 ? 'Questão' : 'Questões'} do Grupo ({Array.isArray(group.questionIds) ? group.questionIds.length : 0})
                      </label>
                      <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 bg-white rounded-lg border border-slate-200">
                        {list.questions.map((question) => {
                          const currentQuestionIds = Array.isArray(group.questionIds) ? group.questionIds : [];
                          const isInGroup = currentQuestionIds.includes(question.id);
                          const isInOtherGroup = !isInGroup && usedQuestionIds.has(question.id);
                          
                          return (
                            <label
                              key={question.id}
                              className={`flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer transition-colors ${
                                isInGroup
                                  ? 'bg-blue-50 border border-blue-200'
                                  : isInOtherGroup
                                  ? 'bg-slate-100 opacity-50 cursor-not-allowed'
                                  : 'hover:bg-slate-50 border border-transparent'
                              }`}
                            >
                              <Checkbox
                                checked={isInGroup}
                                onChange={() => handleQuestionToggle(group.id, question.id)}
                                disabled={loading || isInOtherGroup}
                                variant="blue"
                                size="md"
                              />
                              <span className={`font-medium ${isInGroup ? 'text-blue-900' : 'text-slate-700'}`}>
                                {question.title}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {questionGroups.length === 0 && (
                  <div className="text-center py-8 text-slate-500">
                    <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <p className="text-sm font-medium">Nenhum grupo criado</p>
                    <p className="text-xs mt-1">Clique em &quot;Adicionar Grupo&quot; para começar</p>
                  </div>
                )}
              </div>

              {unassignedQuestions.length > 0 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800 font-medium">
                    {unassignedQuestions.length} {unassignedQuestions.length === 1 ? 'questão' : 'questões'} sem grupo
                  </p>
                  <p className="text-xs text-yellow-700 mt-1">
                    {unassignedQuestions.map(q => q.title).join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}
        </form>

        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200">
          <Button 
            type="button"
            variant="outline" 
            onClick={handleClose} 
            className="flex-1 h-12 border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold rounded-xl transition-all duration-200"
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Salvando...
              </div>
            ) : (
              'Salvar Configuração'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
