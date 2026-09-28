import { Router } from 'express';
import {
  countUserCoachMessages,
  findUserById,
  getPlanSessions,
  isUserPremium,
  listCoachMessages,
  saveCoachMessage,
  type CoachMessageDoc,
} from '../db';
import { asyncHandler, getUserId, HttpError } from '../http';
import { requireAuth } from '../middleware/auth';
import { fakeCoachReply } from '../services/coach';

export const coachRouter = Router();

const FREE_MESSAGE_LIMIT = 3;

coachRouter.use(requireAuth);

function toPublicMessage(m: CoachMessageDoc) {
  return {
    id: m._id,
    role: m.role,
    content: m.content,
    createdAt: m.createdAt,
  };
}

coachRouter.get(
  '/messages',
  asyncHandler(async (req, res) => {
    const messages = await listCoachMessages(getUserId(req));
    res.json({ messages: messages.map(toPublicMessage) });
  }),
);

coachRouter.post(
  '/message',
  asyncHandler(async (req, res) => {
    const userId = getUserId(req);
    const text = String(req.body.text ?? '').trim();
    if (!text) throw new HttpError(400, 'Message text is required');

    const user = await findUserById(userId);
    if (!user) throw new HttpError(401, 'User not found');

    const used = await countUserCoachMessages(userId);
    if (!isUserPremium(user) && used >= FREE_MESSAGE_LIMIT) {
      throw new HttpError(402, 'Paywall', {
        code: 'PAYWALL',
        message: 'Unlock premium coaching for 1 hour (demo).',
        freeLimit: FREE_MESSAGE_LIMIT,
      });
    }

    const open = (await getPlanSessions(userId)).find((s) => s.status === 'open');
    const focusLabel = open
      ? `session ${open.index}: ${open.title}`
      : 'your completed plan';

    const userMsg = await saveCoachMessage(userId, 'user', text);
    const replyText = fakeCoachReply(text, focusLabel);
    const assistantMsg = await saveCoachMessage(userId, 'assistant', replyText);

    res.json({
      reply: replyText,
      messages: [toPublicMessage(userMsg), toPublicMessage(assistantMsg)],
    });
  }),
);
