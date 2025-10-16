const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar_url: string;
  eco_points: number;
  level: number;
}

export interface EcoAction {
  id: number;
  title: string;
  category: string;
  points: number;
}

export interface UserAction {
  id: number;
  user_id: number;
  action_id: number | null;
  custom_action: string | null;
  date: string;
  points: number;
  title?: string;
  category?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface Stats {
  total_actions: number;
  total_points: number;
  co2_saved: number;
  daily_stats: Record<string, { count: number; points: number }>;
  category_stats: Record<string, { count: number; points: number }>;
}

class ApiClient {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async register(name: string, email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', data.token);
    }
    return data;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  // User
  async getProfile(): Promise<User> {
    return this.request<User>('/api/user/profile');
  }

  // Actions
  async getActions(): Promise<EcoAction[]> {
    return this.request<EcoAction[]>('/api/actions');
  }

  async addUserAction(action_id?: number, custom_action?: string) {
    return this.request<UserAction & { user: { eco_points: number; level: number } }>(
      '/api/user/actions',
      {
        method: 'POST',
        body: JSON.stringify({ action_id, custom_action }),
      }
    );
  }

  async getUserActions(): Promise<UserAction[]> {
    return this.request<UserAction[]>('/api/user/actions');
  }

  // Stats
  async getStats(): Promise<Stats> {
    return this.request<Stats>('/api/user/stats');
  }

  // Leaderboard
  async getLeaderboard(): Promise<User[]> {
    return this.request<User[]>('/api/leaderboard');
  }

  // Achievements
  async getAchievements(): Promise<Achievement[]> {
    return this.request<Achievement[]>('/api/user/achievements');
  }
}

export const api = new ApiClient();
