"use client";

import { useState } from "react";

import { AuthLayout, AuthForm, AuthInput, AlertMessage, AuthFooter } from "../../components/auth";
import { useLogin } from "../../hooks/useLogin";
import { useAuthCheck } from "../../hooks/useAuthCheck";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { handleLogin, loading, error, setError: _setError } = useLogin();
  const { checkingAuth } = useAuthCheck();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleLogin(email, password);
  }

  const loginIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
  );

  if (checkingAuth) {
    return null;
  }

  return (
    <AuthLayout 
      title="Entrar na plataforma"
      subtitle="Acesse sua conta para continuar"
    >
      <AuthForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Entrar"
        submitIcon={loginIcon}
      >
        <AuthInput
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        
        <AuthInput
          type="password"
          placeholder="Senha"
          value={password}
          onChange={setPassword}
          required
          autoComplete="current-password"
        />
      </AuthForm>

      <AlertMessage type="error" message={error} />

      <AuthFooter 
        links={[
          { text: "Esqueci minha senha", href: "/esqueci-senha" },
          { text: "Criar conta", href: "/cadastro" }
        ]}
      />
    </AuthLayout>
  );
}
