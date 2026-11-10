const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly message: string,
    public readonly data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('cedro_cx_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getAuthToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        let errorMessage = `Erro HTTP ${response.status}`;
        let errorData: any = null;

        try {
          errorData = await response.json();
          if (errorData?.erro) {
            errorMessage = errorData.erro;
          }
        } catch {
          // Resposta não é JSON
        }

        // Se for 401 (token expirado/inválido), limpa o token local
        if (response.status === 401 && typeof window !== 'undefined') {
          if (!endpoint.includes('/api/auth/login')) {
            localStorage.removeItem('cedro_cx_token');
            localStorage.removeItem('cedro_cx_usuario');
            window.dispatchEvent(new Event('auth:unauthorized'));
          }
        }

        throw new ApiError(response.status, errorMessage, errorData);
      }

      // Se status for 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Falha de conexão com a API. Verifique se o Back-end está rodando.');
    }
  }

  public get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  public post<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public patch<T>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
      headers,
    });
  }

  public delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

export const apiClient = new ApiClient();
