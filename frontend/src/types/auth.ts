/**
 * Authentication and User Resource Types
 * Strictly synchronized with backend/app/schemas/auth.py and backend/app/schemas/user.py
 */

export interface UserRead {
  id: string;
  email: string;
  full_name: string | null;
  role: 'visitor' | 'authenticated_user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserRegisterRequest {
  email: string;
  password: string;
  full_name?: string | null;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserRead;
}

export interface UserUpdate {
  full_name?: string | null;
  email?: string | null;
  password?: string | null;
}
