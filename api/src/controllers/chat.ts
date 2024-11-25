import { NextFunction, Request, Response } from 'express';

import { convertSpeechToText } from '../functions/chat';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import UserModel from '../models/user';
import { askGoogleGenAI } from '../functions/llm';
import { Statistics } from '../types/user';

const AI_INSTRUCTIONS = `Act like you're a creative cute woman. Your answer must be under 120 characters.`;

export const akAI = async (req: Request, res: Response, next: NextFunction) => {
  if (!isReqValid(req, next)) return;

  const { config, recordingBase64, userId } = req.body;
  const defaultErrMessage = `Unable to handle chat request`;

  try {
    // Find a user in db
    const user = await UserModel.findById(userId);
    if (!user) {
      next(new HttpError('Unable to get user data from db', 500));
      return;
    }

    // Convert user's speech to text
    const speechToTextResult = await convertSpeechToText({
      config,
      recordingBase64,
    });
    if (speechToTextResult.error) {
      logger.r(speechToTextResult.error.message);
      next(new HttpError(speechToTextResult.error.message, 500));
      return;
    }
    if (!speechToTextResult.data) {
      const errMessage = `Unable to convert speech to text`;
      logger.r(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }

    const {
      langCode,
      requestId,
      totalBilledTime,
      transcript: humanMessage,
    } = speechToTextResult.data;

    const langName = langCode === 'en-us' ? 'English' : 'Ukrainian';

    // Ask AI
    const googleAIResult = await askGoogleGenAI({
      instructions: `${AI_INSTRUCTIONS} Answer in ${langName}`,
      question: humanMessage,
    });

    if (!googleAIResult.data) {
      const errMessage = `Unable to get data from AI`;
      logger.r(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }

    const { answer, aiUsage } = googleAIResult.data;

    // Handle statistics
    // Detect whether a new month has started to reset statistics
    let statistics: Statistics = user.statistics;
    const prevTimestamp = statistics.updTimestamp;
    const prevDate = new Date(prevTimestamp);
    const curDate = new Date();
    const prevDateMonth = prevDate.getMonth();
    const curDateMonth = curDate.getMonth();
    const prevDateYear = prevDate.getFullYear();
    const curDateYear = curDate.getFullYear();
    const isNewMonth =
      prevDateMonth !== curDateMonth || prevDateYear !== curDateYear;

    if (isNewMonth) {
      // Reset statistics
      statistics = {
        google: {
          ai: {
            inputTokens: 0,
            outputTokens: 0,
          },
          sttBilledTime: 0,
        },
        updTimestamp: Date.now(),
      };
    } else {
      statistics.updTimestamp = Date.now();
    }

    // Get current statistics data from the db
    const sttBilledTimeFromDb = user.statistics.google.sttBilledTime;
    const aiInputTokensFromDb = user.statistics.google.ai.inputTokens;
    const aiOutputTokensFromDb = user.statistics.google.ai.outputTokens;

    // Update statistics
    const newSttBilledTime = sttBilledTimeFromDb + totalBilledTime;
    const newAiInputTokens = aiInputTokensFromDb + aiUsage.inputTokens;
    const newAiOutputTokens = aiOutputTokensFromDb + aiUsage.outputTokens;
    user.statistics.google.sttBilledTime = newSttBilledTime;
    user.statistics.google.ai.inputTokens = newAiInputTokens;
    user.statistics.google.ai.outputTokens = newAiOutputTokens;

    await user.save();

    res.status(200).json({
      humanMessage,
      aiMessage: answer,
    });
  } catch (err) {
    logger.r('speechToText', err);
    next(new HttpError(defaultErrMessage, 500));
  }
};
