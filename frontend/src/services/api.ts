import {
  DailySummary,
  FoodItem,
  DailyGoal,
  AiParseResponse,
  CalendarDay,
  CalorieTrendItem,
  MacroDistributionItem,
  SummaryStats
} from '../types';
import { offlineStorage } from './offlineStorage';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('less_kcals_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('less_kcals_token', token);
    } else {
      localStorage.removeItem('less_kcals_token');
    }
  }

  getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('less_kcals_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>)
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        let errorMsg = `Erro ${response.status}`;
        try {
          const errData = await response.json();
          errorMsg = errData.error || errData.message || errorMsg;
        } catch {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      return await response.json();
    } catch (error: any) {
      // Se estiver offline e for busca de refeição diária, tenta cache
      if (!navigator.onLine && endpoint.startsWith('/meals/daily')) {
        const urlParams = new URLSearchParams(endpoint.split('?')[1]);
        const date = urlParams.get('date');
        if (date) {
          const cached = offlineStorage.getDailySummary(date);
          if (cached) return cached as unknown as T;
        }
      }
      throw error;
    }
  }

  // Auth
  async login(email: string, password: string) {
    const res = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(res.token);
    return res;
  }

  async register(name: string, email: string, password: string) {
    const res = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    this.setToken(res.token);
    return res;
  }

  async getMe() {
    return this.request<{ user: any; currentGoal: DailyGoal }>('/auth/me');
  }

  // Goals
  async getGoal(date?: string) {
    const q = date ? `?date=${date}` : '';
    return this.request<DailyGoal>(`/goals${q}`);
  }

  async setGoal(goal: Partial<DailyGoal>) {
    return this.request<DailyGoal>('/goals', {
      method: 'POST',
      body: JSON.stringify(goal)
    });
  }

  // Foods
  async searchFoods(query: string = '', category?: string, limit: number = 30) {
    const params = new URLSearchParams();
    if (query) params.append('q', query);
    if (category) params.append('category', category);
    if (limit) params.append('limit', limit.toString());
    return this.request<FoodItem[]>(`/foods/search?${params.toString()}`);
  }

  async getCategories() {
    return this.request<string[]>('/foods/categories');
  }

  async getFavorites() {
    return this.request<FoodItem[]>('/foods/favorites');
  }

  async toggleFavorite(foodId: string) {
    return this.request<{ isFavorite: boolean; message: string }>(`/foods/favorites/${foodId}`, {
      method: 'POST'
    });
  }

  async getRecentFoods(limit: number = 10) {
    return this.request<FoodItem[]>(`/foods/recent?limit=${limit}`);
  }

  async createCustomFood(food: Partial<FoodItem>) {
    return this.request<FoodItem>('/foods/custom', {
      method: 'POST',
      body: JSON.stringify(food)
    });
  }

  async calculateProportions(foodId: string, quantity: number, unit: string = 'g') {
    return this.request<any>('/foods/calculate', {
      method: 'POST',
      body: JSON.stringify({ foodId, quantity, unit })
    });
  }

  // Meals
  async getDaily(date?: string): Promise<DailySummary> {
    const q = date ? `?date=${date}` : '';
    const summary = await this.request<DailySummary>(`/meals/daily${q}`);
    if (summary && summary.date) {
      offlineStorage.saveDailySummary(summary.date, summary);
    }
    return summary;
  }

  async addItem(item: { date?: string; mealType: string; foodId?: string; name?: string; quantity: number; unit: string }) {
    if (!navigator.onLine) {
      offlineStorage.enqueueAction({ type: 'ADD_ITEM', payload: item });
    }
    return this.request<any>('/meals/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  }

  async updateItem(itemId: string, data: { quantity: number; unit?: string }) {
    return this.request<any>(`/meals/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteItem(itemId: string) {
    return this.request<{ success: boolean; message: string }>(`/meals/items/${itemId}`, {
      method: 'DELETE'
    });
  }

  // Reports
  async getCalendar(month?: string) {
    const q = month ? `?month=${month}` : '';
    return this.request<{ month: string; days: CalendarDay[] }>(`/reports/calendar${q}`);
  }

  async getTrend(days: number = 7) {
    return this.request<CalorieTrendItem[]>(`/reports/trend?days=${days}`);
  }

  async getMacroDistribution(days: number = 7) {
    return this.request<MacroDistributionItem[]>(`/reports/macros?days=${days}`);
  }

  async getSummaryStats() {
    return this.request<SummaryStats>('/reports/summary');
  }

  // AI
  async parseAiText(text: string): Promise<AiParseResponse> {
    return this.request<AiParseResponse>('/ai/parse-text', {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  async parseAiPhoto(formDataOrBase64: FormData | { imageBase64: string }): Promise<AiParseResponse> {
    if (formDataOrBase64 instanceof FormData) {
      return this.request<AiParseResponse>('/ai/parse-photo', {
        method: 'POST',
        body: formDataOrBase64
      });
    } else {
      return this.request<AiParseResponse>('/ai/parse-photo', {
        method: 'POST',
        body: JSON.stringify(formDataOrBase64)
      });
    }
  }

  async confirmAiMeal(payload: { date: string; mealType: string; items: any[] }) {
    return this.request<{ success: boolean; savedCount: number; dailyOverview: DailySummary }>(
      '/ai/confirm-meal',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
  }
}

export const api = new ApiService();
