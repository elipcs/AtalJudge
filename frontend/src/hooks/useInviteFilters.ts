import { useState } from "react";

export type FilterRole = 'all' | 'student' | 'assistant' | 'professor';
export type FilterStatus = 'all' | 'active' | 'used' | 'expired';

export function useInviteFilters() {
  const [filterRole, setFilterRole] = useState<FilterRole>('all');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');

  const updateRoleFilter = (role: FilterRole) => {
    setFilterRole(role);
  };

  const updateStatusFilter = (status: FilterStatus) => {
    setFilterStatus(status);
  };

  const resetFilters = () => {
    setFilterRole('all');
    setFilterStatus('all');
  };

  return {
    filterRole,
    filterStatus,
    updateRoleFilter,
    updateStatusFilter,
    resetFilters,
  };
}
