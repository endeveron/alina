import { NextFunction, Request, Response } from 'express';
import { Readable } from 'stream';

import { ELEVENLABS_API_KEY, GOOGLE_API_KEY } from '../constants';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import UserModel from '../models/user';
import { convertSpeechToText, convertTextToAudio } from '../functions/chat';

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

    // 1. Convert speech to text

    // Make request to google's speech-to-text api
    const speechToTextResult = await convertSpeechToText({
      config,
      recordingBase64,
    });

    const speechToTextErrMessage = `Unable to convert speech to text`;
    if (speechToTextResult.error) {
      logger.r(speechToTextResult.error.message);
      next(new HttpError(speechToTextResult.error.message, 500));
      return;
    }
    if (!speechToTextResult.data) {
      logger.r(speechToTextErrMessage);
      next(new HttpError(speechToTextErrMessage, 500));
      return;
    }

    // Data from google's speech-to-text api
    const {
      languageCode,
      requestId,
      totalBilledTime,
      transcript: humanTranscript,
    } = speechToTextResult.data;

    // Update googleSpeechToText statistics in db.
    const totalBilledTimeFromDb =
      user.statistics.googleSpeechToText.totalBilledTime;
    const newTotalBilledTime = totalBilledTimeFromDb + totalBilledTime;
    user.statistics.googleSpeechToText.totalBilledTime = newTotalBilledTime;
    user.statistics.googleSpeechToText.updTimestamp = Date.now();

    await user.save();

    // 2. Convert text to audio

    // Make request to elevenlabs's text-to-speech api
    const textToAudioResult = await convertTextToAudio({
      text: humanTranscript,
    });

    const textToAudioErrMessage = `Unable to convert text to audio`;
    if (textToAudioResult.error) {
      logger.r(textToAudioResult.error.message);
      next(new HttpError(textToAudioResult.error.message, 500));
      return;
    }
    if (!textToAudioResult.data) {
      logger.r(textToAudioErrMessage);
      next(new HttpError(textToAudioErrMessage, 500));
      return;
    }
    const { audioUrl } = textToAudioResult.data;

    res.status(200).json({
      audioUrl,
      humanTranscript,
      aiTranscript: humanTranscript,
    });
  } catch (err) {
    logger.r('speechToText', err);
    next(new HttpError(defaultErrMessage, 500));
  }
};
