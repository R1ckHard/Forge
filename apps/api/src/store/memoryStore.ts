import type { CoachMessageDoc, PlanSessionDoc, UserDoc } from '../types';
import { DuplicateEmailError, type DataStore } from './types';

type MemoryMaps = {
  users: Map<string, UserDoc>;
  /** email → userId for unique constraint */
  emails: Map<string, string>;
  planSessions: Map<string, PlanSessionDoc>;
  coachMessages: Map<string, CoachMessageDoc>;
};

export function createMemoryStore(): DataStore {
  const maps: MemoryMaps = {
    users: new Map(),
    emails: new Map(),
    planSessions: new Map(),
    coachMessages: new Map(),
  };

  return {
    async findUserByEmail(email) {
      const id = maps.emails.get(email);
      return id ? (maps.users.get(id) ?? null) : null;
    },

    async findUserById(id) {
      return maps.users.get(id) ?? null;
    },

    async insertUser(user) {
      if (maps.emails.has(user.email)) {
        throw new DuplicateEmailError();
      }
      maps.emails.set(user.email, user._id);
      maps.users.set(user._id, user);
    },

    async setPremiumUntil(userId, premiumUntil) {
      const user = maps.users.get(userId);
      if (user) user.premiumUntil = premiumUntil;
    },

    async listSessions(userId) {
      return [...maps.planSessions.values()]
        .filter((s) => s.userId === userId)
        .sort((a, b) => a.index - b.index);
    },

    async findSessionForUser(sessionId, userId) {
      const session = maps.planSessions.get(sessionId);
      if (!session || session.userId !== userId) return null;
      return session;
    },

    async insertSessions(sessions) {
      for (const session of sessions) {
        maps.planSessions.set(session._id, session);
      }
    },

    async saveSession(session) {
      maps.planSessions.set(session._id, session);
    },

    async listMessages(userId, limit) {
      return [...maps.coachMessages.values()]
        .filter((m) => m.userId === userId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .slice(-limit);
    },

    async countUserMessages(userId) {
      return [...maps.coachMessages.values()].filter(
        (m) => m.userId === userId && m.role === 'user',
      ).length;
    },

    async insertMessage(doc) {
      maps.coachMessages.set(doc._id, doc);
    },

    async dump() {
      return {
        mode: 'memory' as const,
        users: [...maps.users.values()].map(({ passwordHash: _pw, ...rest }) => rest),
        planSessions: [...maps.planSessions.values()].sort(
          (a, b) => a.userId.localeCompare(b.userId) || a.index - b.index,
        ),
        coachMessages: [...maps.coachMessages.values()].sort(
          (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
        ),
      };
    },
  };
}
