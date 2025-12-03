"use client";

import { useEffect } from "react";
import { AuthLayout, ForgotPasswordForm } from "../../components/auth";
import { useForgotPassword } from "../../hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const { checkingAuth, checkAuthentication } = useForgotPassword();

  useEffect(() => {
    checkAuthentication();
  }, [checkAuthentication]);

  if (checkingAuth) {
    return null;
  }

  return (
    <AuthLayout 
      title="Recuperar senha"
      subtitle="Informe seu e-mail para receber o link de redefinição"
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
