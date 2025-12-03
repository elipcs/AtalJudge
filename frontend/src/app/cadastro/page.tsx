"use client";

import { Suspense } from "react";
import { AuthLayout,
  RegistrationForm, 
  TokenValidation, 
  AlertMessage, 
  AuthFooter,
  RegistrationSuccess 
} from "../../components/auth";
import { useRegistration } from "../../hooks/useRegistration";

function UserRegistrationForm() {
  const {
    token,
    tokenInfo,
    setTokenInfo,
    error,
    isRegistrationFinished,
    countdown,
    handleSubmit,
    getRoleTitle
  } = useRegistration();

  if (isRegistrationFinished) {
    return <RegistrationSuccess countdown={countdown} />;
  }

  return (
    <TokenValidation 
      token={token} 
      onTokenValidated={setTokenInfo}
    >
      <AuthLayout 
        title={getRoleTitle()}
        subtitle="Preencha os dados abaixo para finalizar seu cadastro"
      >
        <RegistrationForm
          onSubmit={handleSubmit}
          tokenInfo={tokenInfo || undefined}
        />

        <AlertMessage type="error" message={error} />

        <AuthFooter 
          links={[
            { text: "Já possui conta? Fazer login", href: "/login" }
          ]}
        />
      </AuthLayout>
    </TokenValidation>
  );
}

export default function RegistrationPage() {
  return (
    <Suspense fallback={null}>
      <UserRegistrationForm />
    </Suspense>
  );
}