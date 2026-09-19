import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
    });
    return;
  }

  // Rejected CORS origins arrive here from the cors middleware.
  // Answer 403 (not 500) and don't leak the offending origin detail.
  if (err.message.startsWith('CORS blocked')) {
    res.status(403).json({ error: 'Origin not allowed.' });
    return;
  }

  console.error('Unexpected error:', err);

  res.status(500).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message,
  });
};
