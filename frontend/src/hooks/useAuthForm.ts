import { useForm } from './useForm';

interface UseAuthFormProps {
  initialValues?: Record<string, string>;
  onSubmit: (values: Record<string, string>) => Promise<void> | void;
}

export function useAuthForm({ initialValues = {}, onSubmit }: UseAuthFormProps) {
  return useForm({
    initialValues,
    onSubmit
  });
}
