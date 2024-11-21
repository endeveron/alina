import { NextFunction, Request, Response } from 'express';

import { convertSpeechToText, convertTextToSpeech } from '../functions/chat';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import UserModel from '../models/user';

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
      const speechToTextErrMessage = `Unable to convert speech to text`;
      logger.r(speechToTextErrMessage);
      next(new HttpError(speechToTextErrMessage, 500));
      return;
    }

    const {
      languageCode,
      requestId,
      totalBilledTime,
      transcript: humanTranscript,
    } = speechToTextResult.data;

    // Update statistics in db
    const totalBilledTimeFromDb =
      user.statistics.google.speechToText.totalBilledTime;
    const totalCharactersFromDb =
      user.statistics.google.textToSpeech.totalCharacters;
    const newTotalBilledTime = totalBilledTimeFromDb + totalBilledTime;
    const newTotalCharacters = totalCharactersFromDb + humanTranscript.length;
    user.statistics.google.speechToText.totalBilledTime = newTotalBilledTime;
    user.statistics.google.textToSpeech.totalCharacters = newTotalCharacters;
    user.statistics.google.updTimestamp = Date.now();

    await user.save();

    // Convert text to speech (mp3 audio)
    const textToSpeechResult = await convertTextToSpeech({
      text: humanTranscript,
      languageCode,
    });

    if (textToSpeechResult.error) {
      logger.r(textToSpeechResult.error.message);
      next(new HttpError(textToSpeechResult.error.message, 500));
      return;
    }
    if (!textToSpeechResult.data) {
      const textToAudioErrMessage = `Unable to convert text to speech`;
      logger.r(textToAudioErrMessage);
      next(new HttpError(textToAudioErrMessage, 500));
      return;
    }
    const { audioUrl } = textToSpeechResult.data;

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
