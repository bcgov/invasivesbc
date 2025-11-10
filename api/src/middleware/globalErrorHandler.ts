import { NextFunction, Request, Response } from 'express';
import LoggerHandler from 'utils/endpoints/LoggerHandler';

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
      return { message: err.message || defaultMessage, status: err.status };
    }
  })();
  // express-openapi sends its errors as an API Spec, convert it.
  const transformedError = (() => {
    if (err instanceof CustomError || err instanceof Error) return err;
    return new Error(err.message, { cause: { err } });
  })();
  const errorResponse = {
    message,
    method: req.method,
    namespace: req.url
  };
  if (errorResponse.message !== 'No security handlers returned an acceptable response: Bearer') {
    new LoggerHandler('globalErrorHandler').error(transformedError);
  }
  if (!res.headersSent) res.status(status).json(errorResponse);

  next();
};

export default globalErrorHandler;
export { CustomError };
