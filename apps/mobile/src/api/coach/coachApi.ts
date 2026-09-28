import { apiRequest } from '../client';
import type {
  CoachMessage,
  CoachMessagesResponse,
  SendCoachMessageResponse,
} from './types';

export async function fetchCoachMessages(
  token: string,
): Promise<CoachMessage[]> {
  const data = await apiRequest<CoachMessagesResponse>('/coach/messages', {
    token,
  });
  return data.messages;
}

export async function sendCoachMessage(
  token: string,
  text: string,
): Promise<SendCoachMessageResponse> {
  return apiRequest<SendCoachMessageResponse>('/coach/message', {
    method: 'POST',
    token,
    body: { text },
  });
}
