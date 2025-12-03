import { VALIDATION_RULES } from '../constants';
import { createBrazilianDate } from './dateUtils';

export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.EMAIL.test(email);
}

export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(`Senha deve ter pelo menos ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} caracteres`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/\d/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateName(name: string): {
  isValid: boolean;
  error?: string;
} {
  if (!name.trim()) {
    return { isValid: false, error: 'Nome é obrigatório' };
  }

  if (name.length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    return { 
      isValid: false, 
      error: `Nome deve ter pelo menos ${VALIDATION_RULES.NAME_MIN_LENGTH} caracteres` 
    };
  }

  if (name.length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Nome deve ter no máximo ${VALIDATION_RULES.NAME_MAX_LENGTH} caracteres` 
    };
  }

  if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(name)) {
    return { isValid: false, error: 'Nome deve conter apenas letras e espaços' };
  }

  return { isValid: true };
}

export function validateTitle(title: string): {
  isValid: boolean;
  error?: string;
} {
  if (!title.trim()) {
    return { isValid: false, error: 'Título é obrigatório' };
  }

  if (title.length > VALIDATION_RULES.TITLE_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Título deve ter no máximo ${VALIDATION_RULES.TITLE_MAX_LENGTH} caracteres` 
    };
  }

  return { isValid: true };
}

export function validateDescription(description: string): {
  isValid: boolean;
  error?: string;
} {
  if (description.length > VALIDATION_RULES.DESCRIPTION_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Descrição deve ter no máximo ${VALIDATION_RULES.DESCRIPTION_MAX_LENGTH} caracteres` 
    };
  }

  return { isValid: true };
}

export function validateNumber(
  value: number | string, 
  min?: number, 
  max?: number
): {
  isValid: boolean;
  error?: string;
} {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numValue)) {
    return { isValid: false, error: 'Valor deve ser um número válido' };
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `Valor deve ser maior ou igual a ${min}` };
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `Valor deve ser menor ou igual a ${max}` };
  }

  return { isValid: true };
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function isValidToken(token: string): boolean {
  return Boolean(token && token.length > 0 && /^[a-zA-Z0-9-_]+$/.test(token));
}

export function isValidDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
}

export function isFutureDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? createBrazilianDate(date) : date;
  if (!dateObj) return false;
  return dateObj > new Date();
}

export function isPastDate(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? createBrazilianDate(date) : date;
  if (!dateObj) return false;
  return dateObj < new Date();
}

export function isNotEmpty<T>(array: T[]): boolean {
  return Array.isArray(array) && array.length > 0;
}

export function isNotEmptyObject(obj: Record<string, unknown>): boolean {
  return Boolean(obj && typeof obj === 'object' && Object.keys(obj).length > 0);
}
