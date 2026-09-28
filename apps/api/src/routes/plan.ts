import { Router } from 'express';
import {
  completeSession,
  ensurePremiumSessions,
  findUserById,
  getPlanSessions,
  getSessionForUser,
  isUserPremium,
} from '../db';
import { asyncHandler, getUserId, HttpError } from '../http';
import { requireAuth } from '../middleware/auth';
import { toPlanResponse, toPublicSession } from '../services/planView';

export const planRouter = Router();

planRouter.use(requireAuth);

planRouter.get(
  '/',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const user = await findUserById(userId);
    if (user && isUserPremium(user)) {
      await ensurePremiumSessions(userId);
    }
    res.json(toPlanResponse(await getPlanSessions(userId)));
  }),
);

planRouter.get(
  '/sessions/:id',
  asyncHandler(async (req, res) => {
    const session = await getSessionForUser(req.params.id, getUserId(req));
    if (!session) throw new HttpError(404, 'Session not found');
    res.json({ session: toPublicSession(session) });
  }),
);

planRouter.post(
  '/sessions/:id/complete',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const result = await completeSession(req.params.id, userId);
    if (!result) throw new HttpError(404, 'Session not found');

    const plan = toPlanResponse(await getPlanSessions(userId));

    res.json({
      session: toPublicSession(result.session),
      unlocked: result.unlocked
        ? {
            id: result.unlocked._id,
            index: result.unlocked.index,
            title: result.unlocked.title,
            status: result.unlocked.status,
          }
        : null,
      ...plan,
    });
  }),
);
