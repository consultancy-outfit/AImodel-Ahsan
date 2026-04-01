const TOKEN_KEY = 'nexusai_token';
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isActive: boolean;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Login failed');
  }
  return res.json() as Promise<AuthResponse>;
}

export async function registerUser(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { message?: string }).message ?? 'Registration failed');
  }
  return res.json() as Promise<AuthResponse>;
}

export async function getProfile(): Promise<AuthUser> {
  const token = getToken();
  const res = await fetch(`${API_URL}/auth/profile`, {
    headers: { Authorization: `Bearer ${token ?? ''}` },
  });
  if (!res.ok) throw new Error('Failed to fetch profile');
  return res.json() as Promise<AuthUser>;
}

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    // Also set as cookie for middleware access
    document.cookie = `nexusai_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    // Notify same-tab listeners (storage event only fires across tabs, not same tab)
    window.dispatchEvent(new CustomEvent('auth-change'));
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    // Also remove cookie
    document.cookie = 'nexusai_token=; path=/; max-age=0; SameSite=Lax';
    // Notify same-tab listeners
    window.dispatchEvent(new CustomEvent('auth-change'));
  }
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}
