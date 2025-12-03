import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "../services/auth";
import { API } from "../config/api";

export function useForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const router = useRouter();

  const checkAuthentication = () => {
    const token = authApi.getToken();
    if (token && !authApi.isTokenExpired(token)) {
      router.push("/home");
      return;
    }
    setCheckingAuth(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    
    try {
      await API.password.forgotPassword(email);
      setMessage("Se o e-mail existir, você receberá instruções para redefinir a senha.");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao solicitar recuperação";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    message,
    error,
    loading,
    checkingAuth,
    checkAuthentication,
    handleSubmit,
  };
}
