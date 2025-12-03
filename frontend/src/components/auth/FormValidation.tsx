"use client";

import { useState, useMemo, useCallback } from "react";

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

interface FormValidationProps {
  rules: Record<string, ValidationRule>;
  values: Record<string, string>;
  onSubmit?: (values: Record<string, string>) => void;
}

export function useFormValidation({ rules, values, onSubmit }: FormValidationProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = useCallback((field: string, value: string): string | null => {
    const rule = rules[field];
    if (!rule) return null;

    if (rule.required && !value.trim()) {
      return rule.message || `${field} é obrigatório`;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      return rule.message || `${field} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      return rule.message || `${field} deve ter no máximo ${rule.maxLength} caracteres`;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `${field} tem formato inválido`;
    }

    if (value && rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateAll = (): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(rules).forEach(field => {
      const error = validateField(field, values[field] || '');
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    const error = validateField(field, values[field] || '');
    setErrors(prev => ({ ...prev, [field]: error || '' }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(Object.keys(rules).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    if (validateAll() && onSubmit) {
      onSubmit(values);
    }
  };

  const isValid = useMemo(() => {
    return Object.keys(rules).every(field => {
      const error = validateField(field, values[field] || '');
      return !error;
    });
  }, [values, rules, validateField]);

  return {
    errors,
    touched,
    isValid,
    validateField,
    validateAll,
    handleBlur,
    handleSubmit,
    setErrors
  };
}
