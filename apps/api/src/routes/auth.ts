import { Router } from 'express';
import bcrypt from 'bcryptjs';
import {
  createUser,
  DuplicateEmailError,
  findUserByEmail,
  findUserById,
  grantPremiumHours,
  toPublicUser,
} from '../db';
import { asyncHandler, getUserId, HttpError } from '../http';
import { requireAuth, signToken } from '../middleware/auth';

export const authRouter = Router();

const DEMO_PREMIUM_HOURS = 1;

function readCredentials(body: unknown) {
  const raw = (body ?? {}) as { email?: unknown; password?: unknown };
  return {
    email: String(raw.email ?? '').trim(),
    password: String(raw.password ?? ''),
  };
}

authRouter.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { email, password } = readCredentials(req.body);

    if (!email || !email.includes('@')) {
      throw new HttpError(400, 'Valid email is required');
    }
    if (password.length < 6) {
      throw new HttpError(400, 'Password must be at least 6 characters');
    }

    if (await findUserByEmail(email)) {
      throw new HttpError(409, 'Email already registered');
    }

    let user;
    try {
      user = await createUser(email, await bcrypt.hash(password, 10));
    } catch (err) {
      if (err instanceof DuplicateEmailError) {
        throw new HttpError(409, 'Email already registered');
      }
      throw err;
    }

    const token = signToken({ userId: user._id, email: user.email });
    res.status(201).json({ token, user: toPublicUser(user) });
  }),
);

authRouter.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { email, password } = readCredentials(req.body);

    if (!email || !password) {
      throw new HttpError(400, 'Email and password are required');
    }

    const user = await findUserByEmail(email);
    const passwordOk =
      !!user && (await bcrypt.compare(password, user.passwordHash));

    if (!user || !passwordOk) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = signToken({ userId: user._id, email: user.email });
    res.json({ token, user: toPublicUser(user) });
  }),
);

authRouter.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await findUserById(getUserId(req));
    if (!user) throw new HttpError(401, 'User not found');
    res.json(toPublicUser(user));
  }),
);

/** Mock paywall: grant premium for 1 hour. */
authRouter.post(
  '/subscribe-demo',
  requireAuth,
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const premiumUntil = await grantPremiumHours(userId, DEMO_PREMIUM_HOURS);
    const user = await findUserById(userId);
    if (!user) throw new HttpError(401, 'User not found');

    res.json({
      ...toPublicUser(user),
      premiumUntil: premiumUntil.toISOString(),
    });
  }),
);
