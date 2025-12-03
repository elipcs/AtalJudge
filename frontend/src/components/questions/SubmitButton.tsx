import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  onSubmit: () => void;
  disabled?: boolean;
  submitting?: boolean;
}

export default function SubmitButton({ onSubmit, disabled = false, submitting = false }: SubmitButtonProps) {
  return (
    <Button 
      onClick={onSubmit}
      disabled={disabled || submitting}
      className="w-full bg-slate-800 hover:bg-slate-700 text-white"
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="white" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
      {submitting ? 'Enviando...' : 'Enviar Solução'}
    </Button>
  );
}

