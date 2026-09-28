/**
 * Domain layer: unlock, premium seed, coach persistence.
 * Storage is in-memory (see store/).
 */
import { randomUUID } from 'crypto';
import { HttpError } from './http';
import {
  buildFreeSessions,
  buildPremiumSessions,
  isFreePlanCompleted,
} from './planSeed';
import { connectStore, DuplicateEmailError, getStore } from './store';
import type { CoachMessageDoc, PlanSessionDoc, UserDoc } from './types';
import { isPremiumSessionIndex, isUserPremium } from './types';

export type { CoachMessageDoc, PlanSessionDoc, UserDoc } from './types';
export { isUserPremium, toPublicUser } from './types';
export { DuplicateEmailError } from './store';
export { getDbMode } from './store';

export async function connectDb(): Promise<void> {
  await connectStore();
}

export async function dumpStore() {
  return getStore().dump();
}

// ——— users ———

export async function findUserByEmail(email: string): Promise<UserDoc | null> {
  return getStore().findUserByEmail(email.toLowerCase().trim());
}

export async function findUserById(id: string): Promise<UserDoc | null> {
  return getStore().findUserById(id);
}

export async function createUser(
  email: string,
  passwordHash: string,
): Promise<UserDoc> {
  const user: UserDoc = {
    _id: randomUUID(),
    email: email.toLowerCase().trim(),
    passwordHash,
    createdAt: new Date(),
    premiumUntil: null,
  };

  try {
    await getStore().insertUser(user);
  } catch (err) {
    if (err instanceof DuplicateEmailError) throw err;
    throw err;
  }

  await getStore().insertSessions(buildFreeSessions(user._id));
  return user;
}

/** Demo premium: unlock for N hours and ensure sessions 4–6 exist. */
export async function grantPremiumHours(
  userId: string,
  hours = 1,
): Promise<Date> {
  const premiumUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
  await getStore().setPremiumUntil(userId, premiumUntil);
  await ensurePremiumSessions(userId);
  return premiumUntil;
}

// ——— plan sessions ———

export async function ensurePremiumSessions(userId: string): Promise<void> {
  const existing = await getPlanSessions(userId);
  if (existing.some((s) => isPremiumSessionIndex(s.index))) return;

  await getStore().insertSessions(
    buildPremiumSessions(userId, isFreePlanCompleted(existing)),
  );
}

export async function getPlanSessions(
  userId: string,
): Promise<PlanSessionDoc[]> {
  return getStore().listSessions(userId);
}

export async function getSessionForUser(
  sessionId: string,
  userId: string,
): Promise<PlanSessionDoc | null> {
  return getStore().findSessionForUser(sessionId, userId);
}

export async function completeSession(
  sessionId: string,
  userId: string,
): Promise<{ session: PlanSessionDoc; unlocked: PlanSessionDoc | null } | null> {
  const store = getStore();
  const session = await store.findSessionForUser(sessionId, userId);
  if (!session) return null;
  if (session.status === 'locked') {
    throw new HttpError(403, 'Session is locked');
  }

  if (session.status === 'completed') {
    const sessions = await store.listSessions(userId);
    const next = sessions.find((s) => s.index === session.index + 1) ?? null;
    return { session, unlocked: next?.status === 'open' ? next : null };
  }

  session.status = 'completed';
  session.completedAt = new Date();

  const unlocked = await unlockNextIfAllowed(session, userId);

  await store.saveSession(session);
  if (unlocked) await store.saveSession(unlocked);

  return { session, unlocked };
}

/** Unlock N+1 when locked; premium sessions require active premium. */
async function unlockNextIfAllowed(
  completed: PlanSessionDoc,
  userId: string,
): Promise<PlanSessionDoc | null> {
  const sessions = await getStore().listSessions(userId);
  const next = sessions.find((s) => s.index === completed.index + 1) ?? null;
  if (!next || next.status !== 'locked') return null;

  if (isPremiumSessionIndex(next.index)) {
    const user = await getStore().findUserById(userId);
    if (!isUserPremium(user)) return null;
  }

  next.status = 'open';
  return next;
}

// ——— coach messages ———

export async function listCoachMessages(
  userId: string,
  limit = 50,
): Promise<CoachMessageDoc[]> {
  return getStore().listMessages(userId, limit);
}

export async function countUserCoachMessages(userId: string): Promise<number> {
  return getStore().countUserMessages(userId);
}

export async function saveCoachMessage(
  userId: string,
  role: 'user' | 'assistant',
  content: string,
): Promise<CoachMessageDoc> {
  const doc: CoachMessageDoc = {
    _id: randomUUID(),
    userId,
    role,
    content,
    createdAt: new Date(),
  };
  await getStore().insertMessage(doc);
  return doc;
}
