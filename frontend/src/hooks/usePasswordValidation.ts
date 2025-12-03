import { useState, useMemo } from "react";

export interface PasswordValidation {
  minLength: boolean;
  hasLetters: boolean;
  hasNumbers: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

export function usePasswordValidation(minLength: number = 8) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const validation = useMemo((): PasswordValidation => ({
    minLength: password.length >= minLength,
    hasLetters: /[a-zA-Z]/.test(password),
    hasNumbers: /[0-9]/.test(password),
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  }), [password, minLength]);

  const isValid = useMemo(() => {
    return validation.minLength && 
           validation.hasLetters && 
           validation.hasNumbers && 
           validation.hasUppercase &&
           validation.hasLowercase &&
           validation.hasSpecialChar &&
           password === confirmPassword;
  }, [validation, password, confirmPassword]);

  const getValidationError = (): string | null => {
    if (!validation.minLength) {
      return `Senha deve ter pelo menos ${minLength} caracteres`;
    }
    if (!validation.hasLetters) {
      return "Senha deve conter letras";
    }
    if (!validation.hasNumbers) {
      return "Senha deve conter números";
    }
    if (!validation.hasUppercase) {
      return "Senha deve conter pelo menos 1 letra maiúscula";
    }
    if (!validation.hasLowercase) {
      return "Senha deve conter pelo menos 1 letra minúscula";
    }
    if (!validation.hasSpecialChar) {
      return "Senha deve conter pelo menos 1 caractere especial";
    }
    if (password !== confirmPassword) {
      return "As senhas não coincidem";
    }
    return null;
  };

  return {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    validation,
    isValid,
    getValidationError,
  };
}
