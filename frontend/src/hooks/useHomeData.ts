import { homeApi } from '../services/home';
import { authApi } from '../services/auth';

import { useAsyncData } from './useAsyncData';

export const useStudentHomeData = () => {
  return useAsyncData(
    () => homeApi.student.getStudentData(),
    { immediate: true }
  );
};

export const useStaffHomeData = () => {
  return useAsyncData(
    () => homeApi.staff.getStaffData(),
    { immediate: true }
  );
};

export const useCurrentUser = () => {
  const hasToken = authApi.getToken();
  
  const result = useAsyncData(
    () => homeApi.user.getCurrentUser(),
    { immediate: !!hasToken }
  );

  return result;
};
export const useActiveLists = () => {
  return useAsyncData(
    () => homeApi.staff.getActiveLists(),
    { immediate: true }
  );
};

export const useSystemNotices = () => {
  return useAsyncData(
    () => homeApi.staff.getSystemNotices(),
    { immediate: true }
  );
};
