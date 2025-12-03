"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

import { AuthLayout, ResetPasswordForm, ResetPasswordSuccess } from "../../components/auth";
import { useResetPassword } from "../../hooks/useResetPassword";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const resetPasswordHook = useResetPassword(token);

  if (resetPasswordHook.success) {
    return <ResetPasswordSuccess />;
  }

  return (
    <AuthLayout 
      title="Redefinir senha"
      subtitle="Digite e confirme sua nova senha para acessar a plataforma"
    >
      <ResetPasswordForm token={token} resetPasswordHook={resetPasswordHook} />
    </AuthLayout>
  );
}

export default function PasswordResetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
