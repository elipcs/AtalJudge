"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Dropdown } from "../../components/ui/dropdown";
import { useUserRoleContext } from "../../contexts/UserRoleContext";
import { submissionsApi, SubmissionFilters } from "../../services/submissions";
import { listsApi, isCurrentIpAllowedForList } from "../../services/lists";
import { Submission } from "../../types";
import { SubmissionResponseDTO } from "@/types/dtos";
import PageHeader from "../../components/PageHeader";
import PageLoading from "../../components/PageLoading";
import SubmissionStatusModal from "../../components/submissions/SubmissionStatusModal";
import { getSubmissionStatusColor, normalizeStatus, getVerdictColor } from "../../utils/statusUtils";
import { SUBMISSION_STATUS_OPTIONS } from "../../constants";
import { logger } from '@/utils/logger';
import { getVerdictBadgeColor } from "@/utils/statusUtils";
import { formatLanguageName } from "@/utils/languageUtils";
import * as apiConfig from "@/config/api";

interface SubmissionsPageState {
  submissions: SubmissionResponseDTO[];
  filteredSubmissions: SubmissionResponseDTO[];
  loading: boolean;
  debouncedSearchTerm: string;
  selectedStatus: string;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  totalItems: number;
  restrictedListIds: Set<string>;
  selectedSubmissionId: string | null;
  isModalOpen: boolean;
}

export default function SubmissoesPage() {
  const { userRole } = useUserRoleContext();
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const [state, setState] = useState<SubmissionsPageState>({
    submissions: [],
    filteredSubmissions: [],
    loading: true,
    debouncedSearchTerm: "",
    selectedStatus: "all",
    currentPage: 1,
    itemsPerPage: 20,
    totalPages: 1,
    totalItems: 0,
    restrictedListIds: new Set(),
    selectedSubmissionId: null,
    isModalOpen: false,
  });

  const loadSubmissions = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      let response;

      if (state.debouncedSearchTerm.trim()) {
        // Global search
        const params = new URLSearchParams();
        params.append('q', state.debouncedSearchTerm);
        params.append('page', state.currentPage.toString());
        params.append('limit', state.itemsPerPage.toString());
        if (state.selectedStatus !== "all") {
          params.append('verdict', state.selectedStatus as string);
        }

        const result = await apiConfig.get<any>(`/submissions/search/global?${params.toString()}`);
        response = {
          submissions: result.data?.submissions || [],
          pagination: {
            page: result.data?.page || 1,
            limit: result.data?.limit || 20,
            total: result.data?.total || 0,
            totalPages: Math.ceil((result.data?.total || 0) / (result.data?.limit || 20))
          }
        };
      } else {
        // Regular query with filters
        const filters: SubmissionFilters = {
          page: state.currentPage,
          limit: state.itemsPerPage
        };

        if (state.selectedStatus !== "all") {
          filters.verdict = state.selectedStatus as any;
        }

        response = await submissionsApi.getSubmissions(filters);
      }

      const restrictedListIds = new Set<string>();

      const accessibleSubmissions = response.submissions;

      setState(prev => ({
        ...prev,
        submissions: accessibleSubmissions,
        filteredSubmissions: accessibleSubmissions,
        loading: false,
        restrictedListIds,
        totalPages: response.pagination.totalPages,
        totalItems: response.pagination.total
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        submissions: [],
        filteredSubmissions: [],
        totalPages: 1,
        totalItems: 0
      }));
    }
  }, [state.currentPage, state.itemsPerPage, state.selectedStatus, state.debouncedSearchTerm]);

  // Debounce logic for search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setState(prev => ({ ...prev, debouncedSearchTerm: searchTerm, currentPage: 1 }));
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    const id = setTimeout(() => { loadSubmissions(); }, 0);
    return () => clearTimeout(id);
  }, [loadSubmissions]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleStatusChange = (status: string) => {
    setState(prev => ({ ...prev, selectedStatus: status, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setState(prev => ({ ...prev, currentPage: page }));
  };

  const refreshSubmissions = () => {
    loadSubmissions();
  };

  const handleSubmissionClick = (submissionId: string) => {
    setState(prev => ({
      ...prev,
      selectedSubmissionId: submissionId,
      isModalOpen: true
    }));
  };

  const handleCloseModal = () => {
    setState(prev => ({
      ...prev,
      selectedSubmissionId: null,
      isModalOpen: false
    }));
  };

  const handleResubmit = async (submissionId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm('Deseja realmente re-submeter esta submissão? Uma nova submissão será criada com os mesmos dados.')) {
      return;
    }

    try {
      setState(prev => ({ ...prev, loading: true }));
      await submissionsApi.resubmit(submissionId);
      setState(prev => ({ ...prev, loading: false }));
      alert('Submissão re-submetida com sucesso!');
      await loadSubmissions();
    } catch (error) {
      setState(prev => ({ ...prev, loading: false }));
      alert('Erro ao re-submeter a submissão. Tente novamente.');
    }
  };

  if (state.loading) {
    return <PageLoading message="Carregando submissões..." description="Buscando dados das submissões" />;
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title={userRole === 'student' ? "Minhas Submissões" : "Submissões"}
        description={
          userRole === 'student'
            ? "Acompanhe suas submissões e resultados"
            : "Visualize e acompanhe todas as submissões dos estudantes"
        }
        icon={
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        }
        iconColor="indigo"
      />

      { }
      {userRole === 'student' && state.restrictedListIds.size > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-xl">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-800">Submissões Restritas por IP</h3>
              <p className="text-yellow-700">
                Algumas submissões não estão sendo exibidas porque pertencem a listas com restrição de IP.
                Seu endereço IP atual não está autorizado para visualizar essas submissões.
              </p>
            </div>
          </div>
        </Card>
      )}

      { }
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por questão, lista ou estudante..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-2">
            <Dropdown
              value={state.selectedStatus}
              onChange={handleStatusChange}
              options={SUBMISSION_STATUS_OPTIONS}
              placeholder="Selecione um status"
            />

            <Dropdown
              value={state.itemsPerPage.toString()}
              onChange={(value) => setState(prev => ({ ...prev, itemsPerPage: Number(value), currentPage: 1 }))}
              options={[
                { value: "10", label: "10 por página" },
                { value: "20", label: "20 por página" },
                { value: "50", label: "50 por página" },
                { value: "100", label: "100 por página" }
              ]}
              placeholder="Itens por página"
            />

            <Button
              onClick={refreshSubmissions}
              variant="outline"
              className="px-4 py-2 text-sm"
            >
              Atualizar
            </Button>
          </div>
        </div>
      </Card>

      { }
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Submissões ({state.totalItems})
            </h2>
          </div>

          {state.filteredSubmissions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-600">Nenhuma submissão encontrada</p>
              <p className="text-gray-500">
                {searchTerm || state.selectedStatus !== "all"
                  ? "Tente ajustar os filtros de busca"
                  : userRole === 'student'
                    ? "Você ainda não fez nenhuma submissão"
                    : "Nenhum estudante fez submissões ainda"
                }
              </p>
            </div>
          ) : (
            <>
              { }
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Questão</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Lista</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Pontuação</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Linguagem</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Data</th>
                      {userRole !== 'student' && (
                        <th className="text-left py-3 px-4 font-medium text-gray-600">Estudante</th>
                      )}
                      {(userRole === 'professor' || userRole === 'assistant') && (
                        <th className="text-center py-3 px-4 font-medium text-gray-600">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {state.filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSubmissionClick(submission.id)}
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {submission.questionName || 'Questão desconhecida'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">
                            {submission.questionListTitle || 'Lista desconhecida'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVerdictBadgeColor(submission.verdict, submission.status)}`}>
                            {submission.verdict || SUBMISSION_STATUS_OPTIONS.find(opt => opt.value === normalizeStatus(submission.status))?.label || submission.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium">
                            {submission.score}/100
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600">
                            {formatLanguageName(submission.language)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-600 text-sm">
                            {new Date(submission.createdAt).toLocaleString('pt-BR')}
                          </div>
                        </td>
                        {userRole !== 'student' && (
                          <td className="py-3 px-4">
                            <div className="text-gray-600">
                              {submission.userName || submission.userId}
                            </div>
                          </td>
                        )}
                        {(userRole === 'professor' || userRole === 'assistant') && (
                          <td className="py-3 px-4 text-center">
                            <Button
                              onClick={(e) => handleResubmit(submission.id, e)}
                              variant="outline"
                              size="sm"
                              className="px-3 py-1 text-xs hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-colors"
                              title="Re-submeter esta submissão"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            </Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              { }
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  {searchTerm.trim() ? (
                    <>
                      Mostrando {state.filteredSubmissions.length} resultado(s) de {state.totalItems} submissões
                    </>
                  ) : (
                    <>
                      Mostrando {((state.currentPage - 1) * state.itemsPerPage) + 1} a {Math.min(state.currentPage * state.itemsPerPage, state.totalItems)} de {state.totalItems} submissões
                    </>
                  )}
                  {state.totalPages > 1 && (
                    <> · Página {state.currentPage} de {state.totalPages}</>
                  )}
                </div>
                {state.totalPages > 1 && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(1)}
                      disabled={state.currentPage === 1}
                      className="px-3"
                    >
                      ««
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.currentPage - 1)}
                      disabled={state.currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.currentPage + 1)}
                      disabled={state.currentPage === state.totalPages}
                    >
                      Próxima
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(state.totalPages)}
                      disabled={state.currentPage === state.totalPages}
                      className="px-3"
                    >
                      »»
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {state.selectedSubmissionId && (
        <SubmissionStatusModal
          isOpen={state.isModalOpen}
          onClose={handleCloseModal}
          submissionId={state.selectedSubmissionId}
          initialStatus={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.status || 'pending'
          }
          initialLanguage={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.language || 'python'
          }
          initialVerdict={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.verdict
          }
          questionName={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.questionName || ''
          }
          userName={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.userName || ''
          }
          questionListTitle={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.questionListTitle || ''
          }
          code={
            state.submissions.find(s => s.id === state.selectedSubmissionId)?.code || ''
          }
        />
      )}
    </div>
  );
}