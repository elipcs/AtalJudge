import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi, RegistrationFormData, TokenInfo } from '../services/auth';

export interface PasswordValidation {
  minLength: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

export function useRegistration() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string>("");
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [error, setError] = useState("");
  const [isRegistrationFinished, setIsRegistrationFinished] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setTimeout(() => setToken(urlToken), 0);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!isRegistrationFinished) return;

    if (countdown <= 0) {
      router.push('/login');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRegistrationFinished, countdown, router]);

  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 8,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validateForm = (formData: RegistrationFormData): string | null => {
    if (!formData.name.trim()) {
      return "Nome é obrigatório";
    }
    
    if (!formData.email.trim()) {
      return "Email é obrigatório";
    }
    
    if (tokenInfo?.role === 'student' && !formData.studentRegistration?.trim()) {
      return "Matrícula é obrigatória";
    }
    
    if (tokenInfo?.role === 'student' && formData.studentRegistration?.trim()) {
      const studentRegistrationNumeric = formData.studentRegistration.replace(/\D/g, '');
      if (studentRegistrationNumeric.length !== 9 && studentRegistrationNumeric.length !== 11) {
        return "Matrícula deve ter exatamente 9 ou 11 dígitos";
      }
    }
    
    const isPasswordValid = validatePassword(formData.password);
    if (!isPasswordValid.minLength) {
      return "Senha deve ter pelo menos 8 caracteres";
    }
    if (!isPasswordValid.hasLetters) {
      return "Senha deve conter letras";
    }
    if (!isPasswordValid.hasNumbers) {
      return "Senha deve conter números";
    }
    if (!isPasswordValid.hasUppercase) {
      return "Senha deve conter pelo menos 1 letra maiúscula";
    }
    if (!isPasswordValid.hasLowercase) {
      return "Senha deve conter pelo menos 1 letra minúscula";
    }
    if (!isPasswordValid.hasSpecialChar) {
      return "Senha deve conter pelo menos 1 caractere especial";
    }
    
    if (formData.password !== formData.confirmPassword) {
      return "Senhas não conferem";
    }

    return null;
  };

  const handleSubmit = async (formData: RegistrationFormData) => {
    setError("");

    const validationError = validateForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const result = await authApi.registerUser(formData, tokenInfo);
    
    if (!result.success) {
      setError(result.error || "Erro ao realizar cadastro");
      return;
    }
    
    setIsRegistrationFinished(true);
    setCountdown(5);
  };

  const getRoleTitle = () => {
    switch (tokenInfo?.role) {
      case 'student': return 'Cadastro de Aluno';
      case 'assistant': return 'Cadastro de Monitor';
      case 'professor': return 'Cadastro de Professor';
      default: return 'Cadastro';
    }
  };

  return {
    token,
    tokenInfo,
    setTokenInfo,
    error,
    isRegistrationFinished,
    countdown,
    handleSubmit,
    getRoleTitle,
    validatePassword
  };
}
