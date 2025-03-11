import { NextFunction, Request } from 'express';
import { Result, ValidationError, validationResult } from 'express-validator';

import { HttpError } from './error';

const handleHttpError = (
  errData: Result<ValidationError>,
  next: NextFunction
) => {
  const errArray = errData.array();
  const result: string[] = [];

  errArray.forEach((error: ValidationError) => {
    if (error.type === 'alternative') {
      result.push(
        `There are ${error.nestedErrors.length} errors under this alternative list.`
      );
    } else if (error.type === 'field') {
      result.push(`${error.msg} '${error.value}' for '${error.path}'.`);
    }
  });

  const errorMessage = result.length ? result.join(' ') : `Check your data`;
  next(new HttpError(errorMessage, 400));
};

const isReqValid = (req: Request, next: NextFunction) => {
  const errData: Result<ValidationError> = validationResult(req);
  if (!errData.isEmpty()) {
    handleHttpError(errData, next);
    return false;
  }
  return true;
};

export { isReqValid };
