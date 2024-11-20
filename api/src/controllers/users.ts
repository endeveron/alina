import { NextFunction, Request, Response } from 'express';

import { HttpError } from '../helpers/error';
import logger from '../helpers/logger';
import UserModel from '../models/user';

export const getSomething = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.query.userId as string;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return next(
        new HttpError('Unable to find a user with the specified ID.', 404)
      );
    }
    // const favoriteIdArr = user.facts.favorites;
    // if (!favoriteIdArr.length) {
    //   res.status(200).json({
    //     data: { favorites: [] },
    //   });
    //   return;
    // }

    res.status(200).json({
      data: {},
    });
  } catch (err: any) {
    logger.r('getSomething', err);
    return next(new HttpError('Unable to fetch .', 500));
  }
};
