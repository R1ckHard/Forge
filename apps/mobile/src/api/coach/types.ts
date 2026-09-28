export type CoachMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type CoachMessagesResponse = {
  messages: CoachMessage[];
};

export type SendCoachMessageResponse = {
  reply: string;
  messages: CoachMessage[];
};
