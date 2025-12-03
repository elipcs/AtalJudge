import { authApi } from "@/services/auth";
import { useAsyncData } from "./useAsyncData";

export function useAuth() {
  const { data: isAuthenticated, loading: isLoading } = useAsyncData(
    async () => {
      return await authApi.checkAuthentication();
    },
    { immediate: true }
  );

  return { isAuthenticated: isAuthenticated ?? null, isLoading };
}
