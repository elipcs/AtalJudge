import { useState, useCallback, useMemo } from 'react';

interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
  message?: string;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Record<string, ValidationRule>;
  onSubmit?: (values: T) => Promise<void> | void;
}

interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  loading: boolean;
  isValid: boolean;
  setValue: (field: keyof T, value: unknown) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, message: string) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  clearErrors: () => void;
  validateField: (field: keyof T) => string | null;
  validateAll: () => boolean;
  handleChange: (field: keyof T) => (value: unknown) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  reset: () => void;
}

export function useForm<T extends Record<string, unknown>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const { initialValues, validationRules = {}, onSubmit } = options;

  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [loading, setLoading] = useState(false);

  const validateField = useCallback((field: keyof T): string | null => {
    const rule = validationRules[String(field)];
    if (!rule) return null;

    const value = values[field];
    const stringValue = String(value || '');

    if (rule.required && !stringValue.trim()) {
      return rule.message || `${String(field)} é obrigatório`;
    }

    if (stringValue && rule.minLength && stringValue.length < rule.minLength) {
      return rule.message || `${String(field)} deve ter pelo menos ${rule.minLength} caracteres`;
    }

    if (stringValue && rule.maxLength && stringValue.length > rule.maxLength) {
      return rule.message || `${String(field)} deve ter no máximo ${rule.maxLength} caracteres`;
    }

    if (stringValue && rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || `${String(field)} tem formato inválido`;
    }

    if (stringValue && rule.custom) {
      return rule.custom(stringValue);
    }

    return null;
  }, [values, validationRules]);

  const validateAll = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(field => {
      const error = validateField(field as keyof T);
      if (error) {
        newErrors[field as keyof T] = error;
        isValid = false;
      }
    });

    setErrorsState(newErrors);
    return isValid;
  }, [validationRules, validateField]);

  const setValue = useCallback((field: keyof T, value: unknown) => {
    setValuesState(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrorsState(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({ ...prev, ...newValues }));
  }, []);

  const setError = useCallback((field: keyof T, message: string) => {
    setErrorsState(prev => ({ ...prev, [field]: message }));
  }, []);

  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(newErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setErrorsState({});
  }, []);

  const handleChange = useCallback((field: keyof T) => (value: unknown) => {
    setValue(field, value);
  }, [setValue]);

  const handleBlur = useCallback((field: keyof T) => () => {
    setTouchedState(prev => ({ ...prev, [field]: true }));
    const error = validateField(field);
    setErrorsState(prev => ({ ...prev, [field]: error || undefined }));
  }, [validateField]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    const allTouched = Object.keys(validationRules).reduce((acc, key) => ({
      ...acc,
      [key]: true
    }), {} as Partial<Record<keyof T, boolean>>);
    setTouchedState(allTouched);

    if (!validateAll() || !onSubmit) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(values);
    } catch (error) {
      if (error instanceof Error) {
        setError('general' as keyof T, error.message);
      } else {
        setError('general' as keyof T, 'Ocorreu um erro inesperado');
      }
    } finally {
      setLoading(false);
    }
  }, [values, validationRules, validateAll, onSubmit, setError]);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrorsState({});
    setTouchedState({});
    setLoading(false);
  }, [initialValues]);

  const isValid = useMemo(() => {
    return Object.keys(validationRules).every(field => {
      const error = validateField(field as keyof T);
      return !error;
    });
  }, [validationRules, validateField]);

  return {
    values,
    errors,
    touched,
    loading,
    isValid,
    setValue,
    setValues,
    setError,
    setErrors,
    clearErrors,
    validateField,
    validateAll,
    handleChange,
    handleBlur,
    handleSubmit,
    reset
  };
}

export function useAuthForm<T extends Record<string, unknown>>(
  initialValues: T,
  onSubmit: (values: T) => Promise<void> | void
) {
  return useForm({
    initialValues,
    onSubmit
  });
}
