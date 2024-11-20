import jwt from 'jsonwebtoken';

import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../helpers/error';

interface JwtPayload {
  userId: string;
}

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'OPTIONS') return next();

  const handleUnauthenticated = () => {
    return next(new HttpError('Authentication failed', 401));
  };

  try {
    const token = req.headers.authorization?.split(' ')[1]; // Authorization: 'Bearer '
    if (!token) return handleUnauthenticated();

    // verify the token
    const isTokenValid = jwt.verify(token, process.env.JWT_KEY!) as JwtPayload;
    if (!isTokenValid) return handleUnauthenticated();

    // token is valid
    next();
  } catch (err) {
    handleUnauthenticated();
  }
};
