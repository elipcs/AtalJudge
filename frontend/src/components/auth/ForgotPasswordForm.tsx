import { AuthForm, AuthInput, AlertMessage, AuthFooter } from "./index";
import { useForgotPassword } from "../../hooks/useForgotPassword";

export function ForgotPasswordForm() {
  const {
    email,
    setEmail,
    message,
    error,
    loading,
    handleSubmit,
  } = useForgotPassword();

  const sendIcon = (
    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  return (
    <>
      <AuthForm
        onSubmit={handleSubmit}
        loading={loading}
        submitText="Enviar link de recuperação"
        submitIcon={sendIcon}
      >
        <AuthInput
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
      </AuthForm>

      <div className="mt-4">
        <AlertMessage type="success" message={message} />
        <AlertMessage type="error" message={error} />
      </div>

      <AuthFooter 
        links={[
          { text: "Voltar para Login", href: "/login", variant: "outline" }
        ]}
      />
    </>
  );
}
