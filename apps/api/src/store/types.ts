import type { CoachMessageDoc, PlanSessionDoc, UserDoc } from '../types';

/** In-memory persistence contract. */
export type DataStore = {
  findUserByEmail(email: string): Promise<UserDoc | null>;
  findUserById(id: string): Promise<UserDoc | null>;
  /** Throws DuplicateEmailError if email taken. */
  insertUser(user: UserDoc): Promise<void>;
  setPremiumUntil(userId: string, premiumUntil: Date): Promise<void>;

  listSessions(userId: string): Promise<PlanSessionDoc[]>;
  findSessionForUser(
    sessionId: string,
    userId: string,
  ): Promise<PlanSessionDoc | null>;
  insertSessions(sessions: PlanSessionDoc[]): Promise<void>;
  saveSession(session: PlanSessionDoc): Promise<void>;

  listMessages(userId: string, limit: number): Promise<CoachMessageDoc[]>;
  countUserMessages(userId: string): Promise<number>;
  insertMessage(doc: CoachMessageDoc): Promise<void>;

  dump(): Promise<{
    mode: 'memory';
    users: Omit<UserDoc, 'passwordHash'>[];
    planSessions: PlanSessionDoc[];
    coachMessages: CoachMessageDoc[];
  }>;
};

export class DuplicateEmailError extends Error {
  constructor() {
    super('Email already registered');
    this.name = 'DuplicateEmailError';
  }
}
