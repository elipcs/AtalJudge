/**
 * Converte tempo de milissegundos para segundos
 * @param ms - Tempo em milissegundos
 * @returns Tempo em segundos com 1 casa decimal
 */
export function msToSeconds(ms: number | undefined): string {
  if (!ms) return "1s";
  const seconds = (ms / 1000).toFixed(1);
  return `${seconds}s`;
}

/**
 * Converte tempo em segundos para milissegundos
 * @param seconds - Tempo em segundos (pode ser string com "s" no final)
 * @returns Tempo em milissegundos
 */
export function secondsToMs(seconds: string | number): number {
  let num = typeof seconds === "string" 
    ? parseFloat(seconds.replace(/s$/i, ""))
    : seconds;
  
  if (isNaN(num) || num <= 0) {
    return 1000; // padrão 1 segundo
  }
  
  return Math.round(num * 1000);
}

/**
 * Converte memória de kilobytes para megabytes
 * @param kb - Memória em kilobytes
 * @returns Memória em megabytes com formatação
 */
export function kbToMb(kb: number | undefined): string {
  if (!kb) return "64 MB";
  const mb = kb / 1024;
  return `${mb.toFixed(0)} MB`;
}

/**
 * Converte memória em megabytes para kilobytes
 * @param mb - Memória em megabytes (pode ser string com "MB" no final)
 * @returns Memória em kilobytes
 */
export function mbToKb(mb: string | number): number {
  let num = typeof mb === "string" 
    ? parseFloat(mb.replace(/mb$/i, ""))
    : mb;
  
  if (isNaN(num) || num <= 0) {
    return 64000; // padrão 64 MB
  }
  
  return Math.round(num * 1024);
}

/**
 * Formata tempo limite para exibição (em segundos)
 * @param value - Valor em ms (backend) ou string "Xs" (frontend)
 * @returns String formatada "X s"
 */
export function formatTimeLimit(value: string | number | undefined): string {
  if (!value) return "1 s";
  
  if (typeof value === "number") {
    // Se for número, assume que é ms (vindo do backend)
    return msToSeconds(value);
  }
  
  // Se for string, assume que é "Xs" (do frontend)
  const num = parseFloat(value.replace(/s$/i, ""));
  if (isNaN(num) || num <= 0) return "1 s";
  
  return `${num.toFixed(1)} s`;
}

/**
 * Formata memória limite para exibição (em megabytes)
 * @param value - Valor em kb (backend) ou string "XMB" (frontend)
 * @returns String formatada "X MB"
 */
export function formatMemoryLimit(value: string | number | undefined): string {
  if (!value) return "64 MB";
  
  if (typeof value === "number") {
    // Se for número, assume que é kb (vindo do backend)
    return kbToMb(value);
  }
  
  // Se for string, assume que é "XMB" (do frontend)
  const num = parseFloat(value.replace(/mb$/i, ""));
  if (isNaN(num) || num <= 0) return "64 MB";
  
  return `${Math.round(num)} MB`;
}
