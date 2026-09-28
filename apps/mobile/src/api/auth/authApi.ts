import { apiRequest } from '../client';
import type { AuthSession, Credentials, User } from './types';

export async function register(credentials: Credentials): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: credentials,
  });
}

export async function login(credentials: Credentials): Promise<AuthSession> {
  return apiRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}

export async function fetchMe(token: string): Promise<User> {
  return apiRequest<User>('/auth/me', { token });
}

/** Demo paywall — premium for 1 hour. */
export async function subscribeDemo(token: string): Promise<User> {
  return apiRequest<User>('/auth/subscribe-demo', {
    method: 'POST',
    token,
  });
}
