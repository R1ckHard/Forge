export type User = {
  id: string;
  email: string;
  premium: boolean;
  premiumUntil: string | null;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type Credentials = {
  email: string;
  password: string;
};

export function isPremiumActive(user: User | null | undefined): boolean {
  if (!user?.premium) return false;
  if (!user.premiumUntil) return true;
  return new Date(user.premiumUntil).getTime() > Date.now();
}
