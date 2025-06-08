import api from './api';

// 定義類型
export interface User {
  id: number;
  username: string;
  email: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token?: string;
  refresh_token?: string;
}

// 認證服務
class AuthService {
  // 用戶登錄
  async login(credentials: LoginRequest): Promise<User | null> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      if (response.status === 200 && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        localStorage.setItem('refresh_token', response.data.refresh_token || '');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('登錄失敗:', error);
      return null;
    }
  }

  // 用戶註冊
  async register(userData: RegisterRequest): Promise<User | null> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      if (response.status === 201) {
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('註冊失敗:', error);
      return null;
    }
  }

  // 登出
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  // 獲取當前用戶
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  // 檢查是否已登錄
  isLoggedIn(): boolean {
    return !!localStorage.getItem('token') && !!this.getCurrentUser();
  }

  // 檢查是否為管理員
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return !!user && user.is_admin;
  }

  // 刷新令牌
  async refreshToken(): Promise<boolean> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    try {
      const response = await api.post<AuthResponse>('/auth/refresh', {});
      if (response.status === 200 && response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('刷新令牌失敗:', error);
      this.logout();
      return false;
    }
  }

  // 獲取用戶信息
  async getUserProfile(): Promise<User | null> {
    try {
      const response = await api.get<AuthResponse>('/auth/profile');
      if (response.status === 200) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        return response.data.user;
      }
      return null;
    } catch (error) {
      console.error('獲取用戶信息失敗:', error);
      return null;
    }
  }
}

export default new AuthService(); 