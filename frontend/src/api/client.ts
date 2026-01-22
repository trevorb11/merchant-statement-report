const API_BASE = '/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (this.token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth endpoints
  async register(email: string, password: string, businessName?: string, phone?: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, businessName, phone }),
    });
    this.setToken(data.token);
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  async updateProfile(businessName?: string, phone?: string) {
    return this.request<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ businessName, phone }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // Statement endpoints
  async uploadStatements(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.request<{ statements: any[] }>('/statements/upload', {
      method: 'POST',
      body: formData,
    });
  }

  async getStatements() {
    return this.request<{ statements: any[] }>('/statements');
  }

  async deleteStatement(id: string) {
    return this.request<{ message: string }>(`/statements/${id}`, {
      method: 'DELETE',
    });
  }

  async analyzeStatements(statementIds: string[]) {
    return this.request<{ analysis: any }>('/statements/analyze', {
      method: 'POST',
      body: JSON.stringify({ statementIds }),
    });
  }

  async quickAnalyze(files: File[]) {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));
    return this.request<{ analysis: any; saved: boolean }>('/statements/quick-analyze', {
      method: 'POST',
      body: formData,
    });
  }

  async analyzeWithExisting(newFiles: File[], existingStatementIds: string[]) {
    const formData = new FormData();
    newFiles.forEach((file) => formData.append('files', file));
    formData.append('existingStatementIds', JSON.stringify(existingStatementIds));
    return this.request<{ analysis: any; statementIds: string[] }>('/statements/analyze-combined', {
      method: 'POST',
      body: formData,
    });
  }

  // Report endpoints
  async createReport(statementIds: string[], analysis: any) {
    return this.request<{ report: any }>('/reports', {
      method: 'POST',
      body: JSON.stringify({ statementIds, analysis }),
    });
  }

  async getReports() {
    return this.request<{ reports: any[] }>('/reports');
  }

  async getLatestReport() {
    return this.request<{ report: any }>('/reports/latest');
  }

  async getReport(id: string) {
    return this.request<{ report: any }>(`/reports/${id}`);
  }

  async addStatementsToReport(reportId: string, statementIds: string[]) {
    return this.request<{ report: any }>(`/reports/${reportId}/add-statements`, {
      method: 'POST',
      body: JSON.stringify({ statementIds }),
    });
  }

  async getMonthlyHistory() {
    return this.request<{ monthlyHistory: any[] }>('/reports/history/monthly');
  }

  // Lead endpoints
  async captureLead(email: string, businessName?: string, phone?: string, source?: string) {
    return this.request<{ lead: any; isReturning: boolean }>('/leads', {
      method: 'POST',
      body: JSON.stringify({ email, businessName, phone, source }),
    });
  }

  async getLead(id: string) {
    return this.request<{ lead: any }>(`/leads/${id}`);
  }

  async markLeadAnalysisCompleted(id: string) {
    return this.request<{ message: string }>(`/leads/${id}/analysis-completed`, {
      method: 'POST',
    });
  }
}

export const api = new ApiClient();
export default api;
