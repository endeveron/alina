import bcrypt from 'bcryptjs';
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

import { HttpError } from '../helpers/error';
import { getItem } from '../helpers/getFromDb';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import { configureUserData } from '../helpers/user';
import UserModel from '../models/user';
import { User } from '../types/user';
import StatisticsModel from '../models/statistics';
import ChatModel from '../models/chat';

const genetrateJWToken = (userId: string, next: NextFunction) => {
  const jwtKey = process.env.JWT_KEY;

  const handleJWTException = () =>
    next(new HttpError(`Could not generate token.`, 500));

  try {
    if (!jwtKey) return handleJWTException();
    const token = jwt.sign({ userId }, jwtKey, { expiresIn: '48h' });
    return token;
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error('genetrateJWToken', err.message);
    } else {
      logger.error('genetrateJWToken', err);
    }
    return handleJWTException();
  }
};

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { name, email, password } = req.body;

  try {
    // Check if the provided email in use
    const emailInUse = await UserModel.exists({ 'account.email': email });

    if (emailInUse) {
      return next(new HttpError('Email in use', 409));
    }

    // Hash the provided password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const user = await UserModel.create({
      account: {
        name,
        email,
        password: hashedPassword,
        role: {
          index: 1,
          name: 'user',
        },
      },
    });

    const userId = user._id;

    // Create a new statistics doc
    await StatisticsModel.create({
      userId,
      google: {
        ai: {
          inputTokens: 0,
          outputTokens: 0,
        },
        sttBilledTime: 0,
      },
      updTimestamp: 0,
    });

    // Create a new chat doc
    await ChatModel.create({
      userId,
      chatSummary: '',
      updTimestamp: 0,
    });

    // generate JWT
    const userIdStr = user._id.toString();
    const token = genetrateJWToken(userIdStr, next);

    res.status(201).json({
      data: {
        token,
        user: configureUserData(user),
      },
    });
  } catch (err) {
    logger.error('Signup', err);
    return next(
      new HttpError('Could not create account. Please try again later.', 500)
    );
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isReqValid(req, next)) return;
  const { email, password } = req.body;

  try {
    // Get user account data from the DB
    const userData = await getItem<User>(UserModel, {
      'account.email': email,
    });
    if (userData?.error) {
      return next(new HttpError('No account registered for this email', 404));
    }
    const user = userData.data;

    // Check provided password
    const isPasswordValid = await bcrypt.compare(
      password,
      user.account.password
    );
    if (!isPasswordValid) {
      return next(new HttpError('Invalid password', 401));
    }

    // Generate JWT
    const userId = user._id.toString();
    const token = genetrateJWToken(userId, next);

    res.status(200).json({
      data: {
        token,
        user: configureUserData(user),
      },
    });
  } catch (err) {
    logger.error('Login', err);
    return next(new HttpError('Login failed. Please try again later', 500));
  }
};
