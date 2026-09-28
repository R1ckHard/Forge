import { apiRequest } from '../client';
import type {
  CompleteSessionResponse,
  PlanResponse,
  PlanSession,
} from './types';

export async function fetchPlan(token: string): Promise<PlanResponse> {
  return apiRequest<PlanResponse>('/plan', { token });
}

export async function fetchSession(
  token: string,
  sessionId: string,
): Promise<PlanSession> {
  const data = await apiRequest<{ session: PlanSession }>(
    `/plan/sessions/${sessionId}`,
    { token },
  );
  return data.session;
}

export async function completeSession(
  token: string,
  sessionId: string,
): Promise<CompleteSessionResponse> {
  return apiRequest<CompleteSessionResponse>(
    `/plan/sessions/${sessionId}/complete`,
    { method: 'POST', token },
  );
}
