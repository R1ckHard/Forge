/** Shared API document types. */

export type SessionStatus = 'locked' | 'open' | 'completed';

export type UserDoc = {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  premiumUntil?: Date | null;
};

export type PlanSessionDoc = {
  _id: string;
  userId: string;
  index: number;
  title: string;
  summary: string;
  status: SessionStatus;
  completedAt?: Date;
};

export type CoachMessageDoc = {
  _id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
};

export function isUserPremium(user: UserDoc | null | undefined): boolean {
  if (!user?.premiumUntil) return false;
  return new Date(user.premiumUntil).getTime() > Date.now();
}

/** Safe user payload for the client (no password hash). */
export function toPublicUser(user: UserDoc) {
  const premium = isUserPremium(user);
  return {
    id: user._id,
    email: user.email,
    premium,
    premiumUntil:
      premium && user.premiumUntil
        ? new Date(user.premiumUntil).toISOString()
        : null,
  };
}

/** Sessions 4+ are premium-gated. */
export function isPremiumSessionIndex(index: number): boolean {
  return index >= 4;
}
