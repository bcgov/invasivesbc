import { NextFunction, Request, Response } from 'express';
import { getLogger } from 'utils/logger';

export class CustomError extends Error {
  code: number;
  constructor(message?: string, code?: number) {
    super(message);
    this.code = code;
  }
}
const globalErrorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const logger = getLogger('Error');
  const code = err instanceof CustomError ? err.code : 500;
  const errorResponse = {
    req: req.body,
    error: err.message || 'Internal Server Error',
    method: req.method,
    namespace: req.url
  };
  logger.error(errorResponse);
  if (!res.headersSent) {
    res.status(code).json(errorResponse);
  }
  next();
};

export default globalErrorHandler;
