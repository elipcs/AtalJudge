"use client";

interface PasswordValidationProps {
  password: string;
  className?: string;
  minLength?: number;
}

interface ValidationRule {
  key: string;
  label: string;
  isValid: boolean;
}

export function PasswordValidation({ password, className = "", minLength = 12 }: PasswordValidationProps) {
  const validatePassword = (password: string) => {
    return {
      minLength: password.length >= minLength,
      hasLetters: /[a-zA-Z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const validation = validatePassword(password);
  
  const rules: ValidationRule[] = [
    {
      key: 'minLength',
      label: `Mínimo ${minLength} caracteres`,
      isValid: validation.minLength
    },
    {
      key: 'hasUppercase',
      label: 'Pelo menos 1 letra maiúscula',
      isValid: validation.hasUppercase
    },
    {
      key: 'hasLowercase',
      label: 'Pelo menos 1 letra minúscula',
      isValid: validation.hasLowercase
    },
    {
      key: 'hasNumbers',
      label: 'Pelo menos 1 número',
      isValid: validation.hasNumbers
    },
    {
      key: 'hasSpecialChar',
      label: 'Pelo menos 1 caractere especial',
      isValid: validation.hasSpecialChar
    }
  ];

  if (!password) return null;

  return (
    <div className={`mt-2 sm:mt-3 p-2 sm:p-3 bg-slate-50 rounded-lg border border-slate-200 ${className}`}>
      <p className="text-xs sm:text-sm font-medium text-slate-700 mb-2">Requisitos da senha:</p>
      <div className="space-y-1">
        {rules.map((rule) => (
          <div 
            key={rule.key}
            className={`flex items-center gap-2 text-xs sm:text-sm ${
              rule.isValid ? 'text-green-600' : 'text-red-600'
            }`}
          >
            <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full flex items-center justify-center text-xs ${
              rule.isValid 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {rule.isValid ? '✓' : '✗'}
            </span>
            {rule.label}
          </div>
        ))}
      </div>
    </div>
  );
}
