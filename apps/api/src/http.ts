import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { log } from './log';
import type { AuthedRequest } from './middleware/auth';

/** Throw from handlers; caught once by errorMiddleware. */
export class HttpError extends Error {
  status: number;
  extra?: Record<string, unknown>;

  constructor(
    status: number,
    message: string,
    extra?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.extra = extra;
  }
}

/** Async routes → Express error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void fn(req, res, next).catch(next);
  };
}

/** After requireAuth. */
export function getUserId(req: Request): string {
  return (req as AuthedRequest).userId;
}

/** Simple request log: METHOD path → status (ms). */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const line = `${req.method} ${req.originalUrl} → ${res.statusCode} (${ms}ms)`;
    if (res.statusCode >= 500) log.error(line);
    else if (res.statusCode >= 400) log.warn(line);
    else log.info(line);
  });
  next();
}

export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, ...err.extra });
    return;
  }

  log.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
}
