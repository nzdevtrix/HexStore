import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { getAuth } from 'firebase/auth';
import { firstValueFrom, Observable } from 'rxjs';

const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  /**
   * Get authorization headers with Firebase ID token
   */
  private async getHeaders(): Promise<HttpHeaders> {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    
    const token = await user.getIdToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  // ====================================
  // USERS API
  // ====================================

  async listUsers(params?: { role?: string; search?: string }): Promise<any> {
    const headers = await this.getHeaders();
    let httpParams = new HttpParams();
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    return firstValueFrom(this.http.get(`${API_BASE}/users`, { headers, params: httpParams }));
  }

  async getUser(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/users/${id}`, { headers }));
  }

  async updateUser(id: string, data: any): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.put(`${API_BASE}/users/${id}`, data, { headers }));
  }

  async updateUserRole(id: string, role: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.patch(`${API_BASE}/users/${id}/role`, { role }, { headers }));
  }

  async deleteUser(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.delete(`${API_BASE}/users/${id}`, { headers }));
  }

  // ====================================
  // PRODUCTS API
  // ====================================

  async listProducts(params?: { category?: string; search?: string; includeDeleted?: boolean }): Promise<any> {
    const headers = await this.getHeaders();
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.includeDeleted) httpParams = httpParams.set('includeDeleted', 'true');
    return firstValueFrom(this.http.get(`${API_BASE}/products`, { headers, params: httpParams }));
  }

  async createProduct(data: any): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.post(`${API_BASE}/products`, data, { headers }));
  }

  async updateProduct(id: string, data: any): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.put(`${API_BASE}/products/${id}`, data, { headers }));
  }

  async deleteProduct(id: string, hard = false): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.delete(`${API_BASE}/products/${id}?hard=${hard}`, { headers }));
  }

  async restoreProduct(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.post(`${API_BASE}/products/${id}/restore`, {}, { headers }));
  }

  // ====================================
  // ORDERS API
  // ====================================

  async listOrders(params?: { status?: string; sellerId?: string }): Promise<any> {
    const headers = await this.getHeaders();
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.sellerId) httpParams = httpParams.set('sellerId', params.sellerId);
    return firstValueFrom(this.http.get(`${API_BASE}/orders`, { headers, params: httpParams }));
  }

  async getOrder(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/orders/${id}`, { headers }));
  }

  async updateOrderStatus(id: string, status: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.patch(`${API_BASE}/orders/${id}/status`, { status }, { headers }));
  }

  async deleteOrder(id: string): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.delete(`${API_BASE}/orders/${id}`, { headers }));
  }

  // ====================================
  // ANALYTICS API
  // ====================================

  async getAnalyticsOverview(): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/analytics/overview`, { headers }));
  }

  async getRevenueAnalytics(period?: string): Promise<any> {
    const headers = await this.getHeaders();
    let httpParams = new HttpParams();
    if (period) httpParams = httpParams.set('period', period);
    return firstValueFrom(this.http.get(`${API_BASE}/analytics/revenue`, { headers, params: httpParams }));
  }

  async getUserAnalytics(): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/analytics/users`, { headers }));
  }

  // ====================================
  // SYSTEM API
  // ====================================

  /**
   * Quick health check (no auth required)
   */
  async healthCheck(): Promise<any> {
    return firstValueFrom(this.http.get(`${API_BASE}/health`));
  }

  /**
   * Detailed system health (requires auth)
   */
  async getSystemHealth(): Promise<any> {
    try {
      const headers = await this.getHeaders();
      return firstValueFrom(this.http.get(`${API_BASE}/system/health`, { headers }));
    } catch (e) {
      // Fall back to public health check
      return this.healthCheck();
    }
  }

  async getCollections(): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/system/collections`, { headers }));
  }

  async getProjectInfo(): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/system/project`, { headers }));
  }

  async seedDatabase(): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.post(`${API_BASE}/system/seed`, {}, { headers }));
  }

  async getProcesses(): Promise<any> {
    const headers = await this.getHeaders();
    return firstValueFrom(this.http.get(`${API_BASE}/system/processes`, { headers }));
  }
}