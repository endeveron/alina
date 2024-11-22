import { NextFunction, Request, Response } from 'express';

import { convertSpeechToText, convertTextToSpeech } from '../functions/chat';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import UserModel from '../models/user';
import { askGoogleGenAI } from '../functions/llm';

const AI_INSTRUCTIONS = `Play the role of a cute clever woman. Be brief and creative.`;

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
      transcript: humanTranscript,
    } = speechToTextResult.data;

    const langName = langCode === 'en-us' ? 'English' : 'Ukrainian';

    // Ask AI
    const googleAIResult = await askGoogleGenAI({
      instructions: `${AI_INSTRUCTIONS} Answer in ${langName}`,
      question: humanTranscript,
    });

    if (!googleAIResult.data) {
      const errMessage = `Unable to get data from AI`;
      logger.r(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }

    const { answer, aiUsage } = googleAIResult.data;

    // Get current statistics data from the db
    const totalBilledTimeFromDb =
      user.statistics.google.speechToText.totalBilledTime;
    const totalCharactersFromDb =
      user.statistics.google.textToSpeech.totalCharacters;
    const aiInputTokensFromDb = user.statistics.google.ai.inputTokens;
    const aiOutputTokensFromDb = user.statistics.google.ai.outputTokens;

    // Update statistics
    const newTotalBilledTime = totalBilledTimeFromDb + totalBilledTime;
    const newTotalCharacters = totalCharactersFromDb + humanTranscript.length;
    const newAiInputTokens = aiInputTokensFromDb + aiUsage.inputTokens;
    const newAiOutputTokens = aiOutputTokensFromDb + aiUsage.outputTokens;
    user.statistics.google.speechToText.totalBilledTime = newTotalBilledTime;
    user.statistics.google.textToSpeech.totalCharacters = newTotalCharacters;
    user.statistics.google.ai.inputTokens = newAiInputTokens;
    user.statistics.google.ai.outputTokens = newAiOutputTokens;
    user.statistics.google.updTimestamp = Date.now();
    await user.save();

    // Convert text to speech (mp3 audio)
    const textToSpeechResult = await convertTextToSpeech({
      text: answer,
      langCode,
    });

    if (textToSpeechResult.error) {
      logger.r(textToSpeechResult.error.message);
      next(new HttpError(textToSpeechResult.error.message, 500));
      return;
    }
    if (!textToSpeechResult.data) {
      const errMessage = `Unable to convert text to speech`;
      logger.r(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }
    const { audioUrl } = textToSpeechResult.data;

    res.status(200).json({
      audioUrl,
      humanTranscript,
      aiTranscript: answer,
    });
  } catch (err) {
    logger.r('speechToText', err);
    next(new HttpError(defaultErrMessage, 500));
  }
};
