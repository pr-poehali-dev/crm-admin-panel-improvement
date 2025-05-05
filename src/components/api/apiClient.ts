
/**
 * Базовый API клиент для интеграции с CRM API
 */

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.token = localStorage.getItem('auth_token');
  }

  // Метод для установки токена авторизации
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Очистка токена при выходе пользователя
  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Общий метод для выполнения запросов
  private async request<T>(
    endpoint: string, 
    method: string = 'GET', 
    data?: any
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const jsonData = await response.json().catch(() => ({}));
      
      return {
        data: jsonData.data,
        error: jsonData.error,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        error: 'Не удалось соединиться с сервером',
        status: 500,
      };
    }
  }

  // GET запрос
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'GET');
  }

  // POST запрос
  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'POST', data);
  }

  // PUT запрос
  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'PUT', data);
  }

  // DELETE запрос
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, 'DELETE');
  }
}

// Экспорт экземпляра для использования в приложении
export const apiClient = new ApiClient();

// Типы данных для использования в API
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  status: 'active' | 'inactive' | 'lead';
  createdAt: string;
}

export interface Sale {
  id: string;
  clientId: string;
  amount: number;
  status: 'completed' | 'pending' | 'canceled';
  date: string;
  products: Array<{id: string, name: string, price: number, quantity: number}>;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'done';
  assignedTo: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
}

// API сервисы для конкретных ресурсов
export const clientsApi = {
  getAll: () => apiClient.get<Client[]>('/clients'),
  getById: (id: string) => apiClient.get<Client>(`/clients/${id}`),
  create: (client: Omit<Client, 'id' | 'createdAt'>) => 
    apiClient.post<Client>('/clients', client),
  update: (id: string, client: Partial<Client>) => 
    apiClient.put<Client>(`/clients/${id}`, client),
  delete: (id: string) => apiClient.delete(`/clients/${id}`),
};

export const salesApi = {
  getAll: () => apiClient.get<Sale[]>('/sales'),
  getById: (id: string) => apiClient.get<Sale>(`/sales/${id}`),
  create: (sale: Omit<Sale, 'id'>) => 
    apiClient.post<Sale>('/sales', sale),
  update: (id: string, sale: Partial<Sale>) => 
    apiClient.put<Sale>(`/sales/${id}`, sale),
  delete: (id: string) => apiClient.delete(`/sales/${id}`),
};

export const tasksApi = {
  getAll: () => apiClient.get<Task[]>('/tasks'),
  getById: (id: string) => apiClient.get<Task>(`/tasks/${id}`),
  create: (task: Omit<Task, 'id'>) => 
    apiClient.post<Task>('/tasks', task),
  update: (id: string, task: Partial<Task>) => 
    apiClient.put<Task>(`/tasks/${id}`, task),
  delete: (id: string) => apiClient.delete(`/tasks/${id}`),
};
