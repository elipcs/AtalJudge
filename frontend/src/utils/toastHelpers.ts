

import { toast as toastFn } from "@/hooks/use-toast";
import { ApiError } from "@/config/api";

export function toastError(error: unknown, title = "Erro"): void {
  let description = "Ocorreu um erro inesperado";

  if (error instanceof ApiError) {
    description = error.message;
  } else if (error instanceof Error) {
    description = error.message;
  } else if (typeof error === "string") {
    description = error;
  }

  toastFn({
    title,
    description,
    variant: "destructive",
  });
}

export function toastSuccess(message: string, title = "Sucesso"): void {
  toastFn({
    title,
    description: message,
  });
}

export function toastInfo(message: string, title = "Informação"): void {
  toastFn({
    title,
    description: message,
  });
}

export async function executeWithToast<T>(
  action: () => Promise<T>,
  successMessage?: string,
  errorTitle = "Erro"
): Promise<T | undefined> {
  try {
    const result = await action();
    
    if (successMessage) {
      toastSuccess(successMessage);
    }
    
    return result;
  } catch (error) {
    toastError(error, errorTitle);
    return undefined;
  }
}

