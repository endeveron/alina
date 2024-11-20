import { NextFunction, Request, Response } from 'express';

import logger from './logger';

export interface IHttpError extends Error {
  code: number;
}

export class HttpError extends Error {
  code: number;

  constructor(message: string, errorCode: number) {
    super(message);
    this.code = errorCode;
  }
}

export const handleHttpError = (
  err: IHttpError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.r('Error', err.message);

  if (res.headersSent) {
    return next(err);
  }
  res.status(err.code || 500);
  res.json({
    error: {
      message: err.message,
      statusCode: err.code,
    },
  });
};
