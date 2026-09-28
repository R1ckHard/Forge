/**
 * Required env. Call assertEnv() once at process start.
 * JWT_SECRET has no fallback — fail closed.
 */
export function assertEnv(): void {
  if (!process.env.JWT_SECRET?.trim()) {
    throw new Error(
      'JWT_SECRET is required. Set it in apps/api/.env (see .env.example).',
    );
  }
}

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

export function port(): number {
  return Number(process.env.PORT) || 4040;
}

/** Local dump route. On by default outside production; set ENABLE_DEBUG_DB=0 to disable. */
export function debugDbEnabled(): boolean {
  if (process.env.ENABLE_DEBUG_DB === '0') return false;
  if (process.env.ENABLE_DEBUG_DB === '1') return true;
  return process.env.NODE_ENV !== 'production';
}
