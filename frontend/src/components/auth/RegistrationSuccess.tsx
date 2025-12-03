import { useRouter } from 'next/navigation';
import { AuthLayout } from './AuthLayout';

interface RegistrationSuccessProps {
  countdown: number;
}

export function RegistrationSuccess({ countdown }: RegistrationSuccessProps) {
  const router = useRouter();

  return (
    <AuthLayout 
      title="Cadastro Realizado!"
      subtitle={`Seu cadastro foi concluído com sucesso. Você será redirecionado automaticamente para a página de login em ${countdown} segundo${countdown !== 1 ? 's' : ''}...`}
      showLogo={false}
    >
      <div className="text-center space-y-6">
        <div className="relative mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold animate-bounce">
            {countdown}
          </div>
        </div>
        
        <div className="space-y-4">          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => router.push('/login')} 
              className="flex-1 h-11 rounded-md bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Ir para Login Agora
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
