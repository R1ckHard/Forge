import type { PlanSessionDoc } from '../types';
import { isPremiumSessionIndex } from '../types';
import { workoutForSession } from './workouts';

/** API shape for one plan session (includes deterministic workout). */
export function toPublicSession(session: PlanSessionDoc) {
  return {
    id: session._id,
    index: session.index,
    title: session.title,
    summary: session.summary,
    status: session.status,
    completedAt: session.completedAt ?? null,
    tier: isPremiumSessionIndex(session.index) ? 'premium' : 'free',
    workout: workoutForSession(session.index),
  };
}

export function toPlanResponse(sessions: PlanSessionDoc[]) {
  const next = sessions.find((s) => s.status === 'open') ?? null;
  return {
    sessions: sessions.map(toPublicSession),
    nextSessionId: next?._id ?? null,
  };
}
