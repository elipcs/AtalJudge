"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

import { Button } from "../ui/button";
import { Submission } from "@/types";
import { normalizeStatus, getVerdictBadgeColor } from "../../utils/statusUtils";
import { listsApi } from "@/services/lists";
import SubmissionStatusModal from "../submissions/SubmissionStatusModal";

interface SubmissionsTableProps {
  submissions: Submission[];
  showActions?: boolean;
}

function QuestionLink({ questionListId, questionId, questionTitle }: { questionListId: string; questionId: string; questionTitle: string }) {
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListAndFindIndex = async () => {
      try {
        const list = await listsApi.getById(questionListId);
        if (list) {
          const questions = list.questions || [];
          const index = questions.findIndex((q: any) => q.id === questionId);
          setQuestionIndex(index >= 0 ? index : 0);
        }
      } catch (error) {
        setQuestionIndex(0);
      } finally {
        setLoading(false);
      }
    };

    fetchListAndFindIndex();
  }, [questionListId, questionId]);

  if (loading) {
    return <span className="text-blue-600">{questionTitle}</span>;
  }

  const href = questionIndex !== null ? `/listas/${questionListId}/questoes?q=${questionIndex}` : `/listas/${questionListId}`;

  return (
    <Link href={href} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
      {questionTitle}
    </Link>
  );
}

export default function SubmissionsTable({ submissions, showActions = false }: SubmissionsTableProps) {
  const [selectedSubmissionId, setSelectedSubmissionId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSubmissionData, setSelectedSubmissionData] = useState<any>(null);

  const safeSubmissions = Array.isArray(submissions) ? submissions : [];

  const openModal = (submission: any) => {
    setSelectedSubmissionId(submission.id);
    setSelectedSubmissionData(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedSubmissionId(null);
    setSelectedSubmissionData(null);
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Últimas Submissões</h3>
      {safeSubmissions.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium text-gray-600 mb-2">Nenhuma submissão encontrada</p>
            <p className="text-sm text-gray-500">Não há submissões disponíveis no momento.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-700">Aluno</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Lista</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Questão</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
              {showActions && (
                <th className="text-left py-3 px-4 font-medium text-gray-700">Ações</th>
              )}
            </tr>
          </thead>
          <tbody>
            {safeSubmissions.slice(0, 5).map((submission: any, index) => {
              const studentName = submission.userName || submission.student?.name || 'Aluno';
              const questionListTitle= submission.questionListTitle|| submission.questionList?.name || 'Lista desconhecida';
              const questionTitle = submission.questionName || submission.question?.name || 'Questão desconhecida';
              const questionListId = submission.questionListId || submission.questionList?.id;
              const questionId = submission.questionId || submission.question?.id;
              
              return (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{studentName}</div>
                    {(submission as any).studentRegistration && (
                      <div className="text-xs text-gray-500">Mat: {(submission as any).studentRegistration}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {questionListId ? (
                      <Link href={`/listas/${questionListId}`} className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                        {questionListTitle}
                      </Link>
                    ) : questionListTitle}
                  </td>
                  <td className="py-3 px-4 text-gray-900">
                    {questionListId && questionId ? (
                      <QuestionLink questionListId={questionListId} questionId={questionId} questionTitle={questionTitle} />
                    ) : questionTitle}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVerdictBadgeColor((submission as any).verdict, submission.status)}`}>
                      {(submission as any).verdict || normalizeStatus(submission.status)}
                    </span>
                  </td>
                  {showActions && (
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => openModal(submission)}
                        variant="outline"
                        size="sm"
                      >
                        Ver detalhes
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
      
      {selectedSubmissionId && selectedSubmissionData && (
        <SubmissionStatusModal
          isOpen={showModal}
          onClose={closeModal}
          submissionId={selectedSubmissionId}
          initialStatus={selectedSubmissionData.status}
          initialLanguage={selectedSubmissionData.language}
          initialVerdict={selectedSubmissionData.verdict}
          code={selectedSubmissionData.code}
          questionName={selectedSubmissionData.questionName || selectedSubmissionData.question?.name}
          questionListTitle={selectedSubmissionData.questionListTitle|| selectedSubmissionData.questionList?.name}
        />
      )}
    </div>
  );
}
