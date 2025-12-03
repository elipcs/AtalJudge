import { PasswordValidation } from '../../hooks/useRegistration';

interface PasswordValidationDisplayProps {
  validation: PasswordValidation;
  className?: string;
}

export function PasswordValidationDisplay({ 
  validation, 
  className = "" 
}: PasswordValidationDisplayProps) {
  const validationItems = [
    {
      key: 'minLength',
      label: 'Pelo menos 8 caracteres',
      isValid: validation.minLength
    },
    {
      key: 'hasUppercase',
      label: 'Contém letra maiúscula',
      isValid: validation.hasUppercase
    },
    {
      key: 'hasLowercase',
      label: 'Contém letra minúscula',
      isValid: validation.hasLowercase
    },
    {
      key: 'hasNumbers',
      label: 'Contém números',
      isValid: validation.hasNumbers
    },
    {
      key: 'hasSpecialChar',
      label: 'Contém caractere especial',
      isValid: validation.hasSpecialChar
    }
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700">Requisitos da senha:</h4>
      <ul className="space-y-1">
        {validationItems.map((item) => (
          <li key={item.key} className="flex items-center gap-2 text-sm">
            <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
              item.isValid 
                ? 'bg-green-100 text-green-600' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {item.isValid ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
              ) : (
                <div className="w-2 h-2 rounded-full bg-current" />
              )}
            </div>
            <span className={item.isValid ? 'text-green-700' : 'text-gray-500'}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
