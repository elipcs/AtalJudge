import { AuthForm, AuthInput, AlertMessage, AuthFooter, PasswordValidation } from "./index";
import { useResetPassword } from "../../hooks/useResetPassword";

export type ResetPasswordHookReturn = ReturnType<typeof useResetPassword>;

interface ResetPasswordFormProps {
  token: string | null;
  resetPasswordHook: ResetPasswordHookReturn;
}

export function ResetPasswordForm({ token, resetPasswordHook }: ResetPasswordFormProps) {
  const {
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    error,
    loading,
    handleSubmit,
  } = resetPasswordHook;

  const resetIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <>
      <AuthForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Redefinir senha"
        submitIcon={resetIcon}
      >
        <div>
          <AuthInput
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={setPassword}
            required
            autoComplete="new-password"
          />
          <PasswordValidation password={password} minLength={8} />
        </div>
        
        <AuthInput
          type="password"
          placeholder="Confirme a nova senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          required
          autoComplete="new-password"
        />
      </AuthForm>

      <AlertMessage type="error" message={error} />

      <AuthFooter 
        links={[
          { text: "Voltar para Login", href: "/login", variant: "outline" }
        ]}
      />
    </>
  );
}
