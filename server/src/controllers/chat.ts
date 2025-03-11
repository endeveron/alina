import { NextFunction, Request, Response } from 'express';

// import { convertSpeechToText } from '../functions/chat';
import { characterMap } from '../data/characters';
import {
  convertSpeechToText,
  createChainForCharacter,
  resetChatSummaryInDB,
  updateTTSUsageStatisticsInDB,
} from '../functions/chat';
import { chatSummaryMap, getMessageMemory } from '../functions/store';
import { cleanIncompleteAnswer } from '../helpers/chat';
import { HttpError } from '../helpers/error';
import { isReqValid } from '../helpers/http';
import logger from '../helpers/logger';
import UserModel from '../models/user';
import { CharacterKey } from '../types/chat';

export const akAI = async (req: Request, res: Response, next: NextFunction) => {
  if (!isReqValid(req, next)) return;

  const { config, recordingBase64, userId } = req.body;
  const defaultErrMessage = `Unable to handle chat request`;

  try {
    // Find the user in db
    const user = await UserModel.findById(userId);
    if (!user) {
      next(new HttpError('Unable to get user data from db', 404));
      return;
    }

    // Convert user's speech to text
    const speechToTextResult = await convertSpeechToText({
      config,
      recordingBase64,
    });
    if (speechToTextResult.error) {
      logger.error(speechToTextResult.error.message);
      next(new HttpError(speechToTextResult.error.message, 500));
      return;
    }
    if (!speechToTextResult.data) {
      const errMessage = `Unable to convert speech to text`;
      logger.error(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }

    const {
      langCode,
      billedTime: sttBilledTime,
      transcript: humanMessage,
    } = speechToTextResult.data;

    if (humanMessage.toLowerCase() === 'reset chat history') {
      let aiMessage = `I see. I’ve forgotten what we were chatting about.`;

      // Clear message history in the buffer memory
      const messageMemory = await getMessageMemory({ userId });
      await messageMemory.chatHistory.clear();

      // Clear chat summary in the local map
      chatSummaryMap.delete(userId);

      // Reset `chat.summary` in the DB
      const isSuccess = await resetChatSummaryInDB({ userId });
      if (!isSuccess) {
        aiMessage = `Uhh! Tech fail. I'm sorry! I can't forget our conversation.`;
      }

      res.status(200).json({
        humanMessage,
        aiMessage,
      });
      return;
    }

    const language = langCode === 'uk-ua' ? 'Ukrainian' : 'English';

    // Get the main character from the map
    const characterKey = CharacterKey.main;
    const character = characterMap.get(characterKey)!;

    // Create the chain
    const chainRes = await createChainForCharacter({
      character: { ...character, key: characterKey },
      userId,
      language,
    });
    if (!chainRes.chain) {
      next(
        new HttpError(
          chainRes.error || 'Could not create a chain for the person.',
          500
        )
      );
      return;
    }

    // Ask AI
    const aiResponse = await chainRes.chain.invoke({
      question: humanMessage,
    });
    // logger.info('aiResponse', aiResponse.result);

    if (!aiResponse.result) {
      const errMessage = `Unable to get AI response.`;
      logger.error(errMessage);
      next(new HttpError(errMessage, 500));
      return;
    }

    // Remove a possible incomplete sentense at the end
    let aiMessage = aiResponse.result;
    if (!aiMessage.endsWith('\n')) {
      aiMessage = cleanIncompleteAnswer(aiMessage);
    } else {
      aiMessage = aiMessage.replace(/\n/g, '');
    }

    res.status(200).json({
      humanMessage,
      aiMessage,
    });

    // LLM usage statistics have already been saved within
    // the `performQuestionAnswering` function call.
    // It is important to continue processing LLM statistics
    // there because the chat history is dynamic.

    // Update speech-to-text usage statistics in the db
    if (sttBilledTime) {
      await updateTTSUsageStatisticsInDB({
        userId,
        sttBilledTime,
      });
    }

    // Maybe: Save the chat message pair in the db
  } catch (err) {
    logger.error('askAI', err);
    next(new HttpError(defaultErrMessage, 500));
  }
};
