import e, { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import { log } from 'winston';

class CustomError extends Error {
  code: number;
  constructor(message?: string, code?: number) {
    super(message);
    this.code = code;
  }
}
interface ExpressOpenApiError {
  status: number;
  message: string;
  errorCode: string;
  errors?: Array<Record<PropertyKey, unknown>>;
}

const globalErrorHandler = (
  err: Error | CustomError | ExpressOpenApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { message, status } = (() => {
    const defaultMessage = 'Internal Server Error';
    if (err instanceof CustomError) {
      return { message: err.message || defaultMessage, status: err?.code ?? 500 };
    } else if (err instanceof Error) {
      return { message: err.message || defaultMessage, status: 500 };
    } else {
      return { message: err?.message || err?.errors || defaultMessage, status: err.status };
    }
  })();
  // Convert regular and custom errors, ignore OpenAPI/Token Errors
  const transformedError = (() => {
    if (err instanceof TokenExpiredError) return null; // ignore errors about Expired JWTs
    if (err instanceof CustomError || err instanceof Error) return err;
    return null; // OpenAPI Error Objects (Malformed query params, etc)
  })();
  const errorResponse = {
    message,
    method: req.method,
    namespace: req.url
  };
  if (transformedError) {
    new LoggerHandler('globalErrorHandler').error(transformedError);
  }
  if (!res.headersSent) res.status(status).json(errorResponse);

  next();
};

export default globalErrorHandler;
export { CustomError };
