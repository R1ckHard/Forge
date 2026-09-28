import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { assertEnv, debugDbEnabled, port } from './config';
import { connectDb, dumpStore, getDbMode } from './db';
import { asyncHandler, errorMiddleware, requestLogger } from './http';
import { log } from './log';
import { authRouter } from './routes/auth';
import { coachRouter } from './routes/coach';
import { planRouter } from './routes/plan';

async function main() {
  assertEnv();
  await connectDb();

  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'forge-api', db: getDbMode() });
  });

  if (debugDbEnabled()) {
    app.get(
      '/debug/db',
      asyncHandler(async (_req, res) => {
        res.json(await dumpStore());
      }),
    );
  }

  app.use('/auth', authRouter);
  app.use('/plan', planRouter);
  app.use('/coach', coachRouter);
  app.use(errorMiddleware);

  const listenPort = port();
  app.listen(listenPort, '0.0.0.0', () => {
    log.info(
      `Forge API listening on http://0.0.0.0:${listenPort} (db=${getDbMode()})`,
    );
  });
}

main().catch((err) => {
  log.error('Failed to start API', err);
  process.exit(1);
});
