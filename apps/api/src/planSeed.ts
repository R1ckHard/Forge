import { randomUUID } from 'crypto';
import type { PlanSessionDoc, SessionStatus } from './types';

type Seed = { index: number; title: string; summary: string };

/** Free plan (seeded on register). */
const FREE_SESSION_SEED: Seed[] = [
  {
    index: 1,
    title: 'Foundation & Intent',
    summary: 'Clarify why you train and set one measurable focus for the week.',
  },
  {
    index: 2,
    title: 'Rhythm & Recovery',
    summary: 'Build a sustainable session cadence and protect recovery windows.',
  },
  {
    index: 3,
    title: 'Progress Check',
    summary: 'Review what stuck, adjust load, and lock the next block.',
  },
];

/** Premium plan (seeded on subscribe). */
const PREMIUM_SESSION_SEED: Seed[] = [
  {
    index: 4,
    title: 'Strength Block',
    summary: 'Push load quality on your main patterns with premium coaching cues.',
  },
  {
    index: 5,
    title: 'Engine & Conditioning',
    summary: 'Build work capacity without frying recovery — controlled intensity.',
  },
  {
    index: 6,
    title: 'Forge Capstone',
    summary: 'Integrate strength, rhythm, and intent into one finishing session.',
  },
];

function toSession(
  userId: string,
  seed: Seed,
  status: SessionStatus,
): PlanSessionDoc {
  return {
    _id: randomUUID(),
    userId,
    index: seed.index,
    title: seed.title,
    summary: seed.summary,
    status,
  };
}

export function buildFreeSessions(userId: string): PlanSessionDoc[] {
  return FREE_SESSION_SEED.map((seed) =>
    toSession(userId, seed, seed.index === 1 ? 'open' : 'locked'),
  );
}

/** Open #4 only when free 1–3 are already completed. */
export function buildPremiumSessions(
  userId: string,
  freePlanCompleted: boolean,
): PlanSessionDoc[] {
  return PREMIUM_SESSION_SEED.map((seed) =>
    toSession(
      userId,
      seed,
      seed.index === 4 && freePlanCompleted ? 'open' : 'locked',
    ),
  );
}

export function isFreePlanCompleted(sessions: PlanSessionDoc[]): boolean {
  return FREE_SESSION_SEED.every((seed) => {
    const match = sessions.find((s) => s.index === seed.index);
    return match?.status === 'completed';
  });
}
