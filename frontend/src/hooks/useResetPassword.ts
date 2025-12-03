import { useState } from "react";
import { usePasswordValidation } from "./usePasswordValidation";
import { API } from "../config/api";

export function useResetPassword(token: string | null) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    isValid,
    getValidationError,
  } = usePasswordValidation(8);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const validationError = getValidationError();
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!token) {
      setError("Token inválido");
      return;
    }

    setLoading(true);

    try {
      await API.password.resetPassword(token, password);
      setSuccess(true);
    } catch (err: unknown) {
      let errorMessage = "Erro ao redefinir senha";
      
      if (err instanceof Error) {
        
        if ('statusCode' in err && err.statusCode) {
          const apiError = err as any;
          
          if (apiError.statusCode !== 408 || !err.message.includes('Timeout')) {
            errorMessage = err.message;
          } else {
            
            errorMessage = "A requisição demorou muito. O token pode estar inválido ou já ter sido usado.";
          }
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    success,
    loading,
    isValid,
    handleSubmit,
  };
}
