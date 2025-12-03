interface HealthCheckDetails {
  status?: number;
  statusText?: string;
  url?: string;
  contentType?: string;
  timeout?: string;
  suggestion?: string;
  error?: unknown;
  [key: string]: unknown;
}

interface HealthCheckResult {
  isHealthy: boolean;
  error?: string;
  details?: HealthCheckDetails;
}

export async function checkBackendHealth(): Promise<HealthCheckResult> {
  
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3333/api';
  const apiUrl = apiBaseUrl.replace(/\/api$/, '');
  
  try {
    const response = await fetch(`${apiUrl}/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        isHealthy: false,
        error: `Backend retornou status ${response.status}`,
        details: {
          status: response.status,
          statusText: response.statusText,
          url: `${apiUrl}/health`
        }
      };
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        isHealthy: false,
        error: `Backend retornou ${contentType} em vez de JSON`,
        details: {
          contentType: contentType || undefined,
          url: `${apiUrl}/health`
        }
      };
    }

    const data = await response.json();
    return {
      isHealthy: true,
      details: data
    };

  } catch (error) {
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      return {
        isHealthy: false,
        error: `Não foi possível conectar ao backend em ${apiUrl}`,
        details: {
          url: apiUrl,
          suggestion: 'Verifique se o servidor backend está rodando'
        }
      };
    }

    if (error instanceof Error && error.name === 'TimeoutError') {
      return {
        isHealthy: false,
        error: 'Timeout ao conectar com o backend',
        details: {
          url: apiUrl,
          timeout: '5000ms'
        }
      };
    }

    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      details: { error }
    };
  }
}

export async function testBackendConnection(): Promise<boolean> {
  const healthCheck = await checkBackendHealth();
  return healthCheck.isHealthy;
}
