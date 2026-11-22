'use server';
import { login as loginService, signUp as signUpService, logout as logoutService } from './service';
import type { SessionUser } from '@/shared/auth/session';

export type ActionState = { ok: boolean; error?: string };

export async function login(input: unknown): Promise<SessionUser | null> {
  return loginService(input);
}

export async function signUp(input: unknown): Promise<SessionUser> {
  return signUpService(input);
}

export async function logout(): Promise<void> {
  return logoutService();
}
