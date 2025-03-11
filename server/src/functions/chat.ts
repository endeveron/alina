import speechToText from '@google-cloud/speech';
import {
  ChatMessage,
  MessageContent,
  SystemMessage,
} from '@langchain/core/messages';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableSequence } from '@langchain/core/runnables';
import { ChatMessageHistory } from 'langchain/memory';
import { formatDocumentsAsString } from 'langchain/util/document';

import { altAnswerList } from '../data/phrases';
import { cleanIncompleteAnswer } from '../helpers/chat';
import { getRandom } from '../helpers/random';
import ChatModel from '../models/chat';
import StatisticsModel from '../models/statistics';
import {
  Character,
  GoogleSpeechToTextConfig,
  LangCodeLower,
  SpeechToTextResData,
} from '../types/chat';
import { Result } from '../types/common';
import { Statistics } from '../types/user';
import {
  createMainChain,
  questionGeneratorChain,
  summarizeChatHistoryChain,
} from './llm';
import {
  chatSummaryMap,
  getMessageMemory,
  getVectorStoreForCharacter,
} from './store';

/** Convert speech to text */

const speechToTextClient = new speechToText.SpeechClient({
  keyFilename: 'google-sa.json',
});

// const convertSpeechToTextUsingGoogleAPI = async ({
//   config,
//   recordingBase64,
// }: {
//   config: GoogleSpeechToTextConfig;
//   recordingBase64: string;
// }): Promise<Result<SpeechToTextResData>> => {
//   const defaultErrMessage = `Unable to transcribe speech`;

//   // Make request to the google api
//   // https://cloud.google.com/speech-to-text/docs/reference/rest/v1/speech/recognize
//   try {
//     const options = {
//       method: 'POST',
//       headers: {
//         Accept: 'application/json',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         config,
//         audio: { content: recordingBase64 },
//       }),
//     };

//     // !! Get the right GOOGLE_API_KEY in Credentials > API Keys
//     // !! Restrictions : 'Cloud Speech-to-Text API'
//     // https://console.cloud.google.com/apis/credentials

//     const response = await fetch(
//       // `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_API_KEY}`,
//       `https://speech.googleapis.com/v1/speech:recognize`,
//       options
//     );

//     if (response && !response.ok) {
//       return {
//         error: { message: defaultErrMessage },
//         data: null,
//       };
//     }

//     const resData = await response.json();
//     if (!resData?.results[0]?.alternatives[0]) {
//       return {
//         error: { message: `Unable to get data from the google api` },
//         data: null,
//       };
//     }

//     // resData {
//     //   results: [
//     //     {
//     //       alternatives: [Array],
//     //       resultEndTime: '2.550s',
//     //       langCode: 'en-us'
//     //     }
//     //   ],
//     //   totalBilledTime: '3s',
//     //   requestId: '884987086151728353'
//     // }

//     // // Get transcript
//     // const transcript = resData.results[0].alternatives[0].transcript ?? '';
//     // if (!transcript) {
//     //   return {
//     //     error: { message: `Unable to get transcript from the google api` },
//     //     data: null,
//     //   };
//     // }

//     // Get transcript
//     const firstResult = resData.results[0];
//     if (!firstResult.alternatives?.length) {
//       return {
//         error: { message: `Unable to get alternatives from the google api` },
//         data: null,
//       };
//     }
//     const transcript = firstResult.alternatives[0].transcript;
//     if (!transcript) {
//       return {
//         error: { message: `Unable to get transcript from the google api` },
//         data: null,
//       };
//     }

//     // The api should provide the totalBilledTime as a string, ending with 's'
//     let totalBilledTime = 0;
//     if (resData.totalBilledTime) {
//       const parsedData = parseInt(
//         resData.totalBilledTime.replace(/s/g, ''),
//         10
//       );
//       if (typeof parsedData === 'number') {
//         totalBilledTime = parsedData;
//       } else {
//         console.error('Invalid totalBilledTime');
//       }
//     }
//     const langCode = resData.langCode;
//     const requestId = resData.requestId;

//     return {
//       error: null,
//       data: {
//         langCode,
//         requestId,
//         transcript,
//         totalBilledTime,
//       },
//     };
//   } catch (err: any) {
//     logger.error(`convertSpeechToTextUsingGoogleAPI: ${defaultErrMessage}`);
//     return {
//       error: { message: defaultErrMessage },
//       data: null,
//     };
//   }
// };

const convertSpeechToTextUsingGoogleClient = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<SpeechToTextResData>> => {
  const defaultErrMessage = `Unable to transcribe speech`;

  // https://codelabs.developers.google.com/codelabs/cloud-speech-text-node#5

  try {
    const request = {
      audio: { content: recordingBase64 },
      config: config,
    };

    // Detects speech in the audio file
    const [resData] = await speechToTextClient.recognize(request);
    if (!resData.results?.length) {
      return {
        error: { message: `Unable to get data from the google client` },
        data: null,
      };
    }

    // resData {
    //   results: [
    //     {
    //       alternatives: [Array],
    //       channelTag: 0,
    //       resultEndTime: [Object],
    //       langCode: 'en-us'
    //     }
    //   ],
    //   totalBilledTime: { seconds: '2', nanos: 0 },
    //   speechAdaptationInfo: null,
    //   requestId: '623930791051385184'
    // }

    // Get transcript
    const firstResult = resData.results[0];
    if (!firstResult.alternatives?.length) {
      return {
        error: { message: `Unable to get alternatives from the google client` },
        data: null,
      };
    }
    // console.log('G-STT result', firstResult);

    const transcript = firstResult.alternatives[0].transcript;
    if (!transcript) {
      return {
        error: { message: `Unable to get transcript from the google client` },
        data: null,
      };
    }

    // Convert totalBilledTime (seconds) to an integer
    let billedTime = 0;
    const seconds = resData.totalBilledTime?.seconds;
    if (typeof seconds === 'number') {
      billedTime = seconds;
    } else if (typeof seconds === 'string') {
      billedTime = parseInt(seconds, 10);
    } else {
      console.error('Invalid totalBilledTime value', resData.totalBilledTime);
    }

    const langCode = firstResult.languageCode as LangCodeLower;
    const requestId = resData.requestId as string;

    return {
      error: null,
      data: {
        langCode,
        requestId,
        transcript,
        billedTime,
      },
    };
  } catch (err: unknown) {
    console.error(`convertSpeechToTextUsingGoogleClient: ${err}`);
    return {
      error: { message: defaultErrMessage },
      data: null,
    };
  }
};

export const convertSpeechToText = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}): Promise<Result<SpeechToTextResData>> => {
  // Make request to the google's speech-to-text api
  // const result = await convertSpeechToTextUsingGoogleAPI({
  //   config,
  //   recordingBase64,
  // });

  // Using the @google-cloud/speech library
  const result = await convertSpeechToTextUsingGoogleClient({
    config,
    recordingBase64,
  });

  return result;
};

const checkIsStatisticsRelevant = (statistics: Statistics): boolean => {
  // Get current year and month
  const curDate = new Date();
  const curYear = curDate.getFullYear();
  const curMonth = curDate.getMonth() + 1;

  // Get year and month from the stts doc
  const statsDate = new Date(statistics.updTimestamp);
  const statsYear = statsDate.getFullYear();
  const statsMonth = statsDate.getMonth() + 1;

  return curYear === statsYear && curMonth === statsMonth;
};

export const updateLLMUsageStatisticsInDB = async ({
  userId,
  instructionTokens,
  question,
  answer,
}: {
  userId: string;
  instructionTokens: number;
  question: string;
  answer: string;
}) => {
  const questionTokens = calculateLLMTokens(question);
  const inputTokens = questionTokens + instructionTokens;
  const outputTokens = answer ? calculateLLMTokens(answer) : 0;
  let prevInput = 0;
  let prevOutput = 0;

  try {
    // Fetch the statistics document
    const statistics = await StatisticsModel.findOne({ userId });
    if (!statistics) {
      console.error(
        '[updateLLMUsageStatisticsInDB]: Unable to find the statistics document in the db.'
      );
      return;
    }

    const isStatsRelevant = checkIsStatisticsRelevant(statistics);
    if (isStatsRelevant) {
      prevInput = statistics.google.ai.inputTokens || 0;
      prevOutput = statistics.google.ai.outputTokens || 0;
    }

    // Update the number of used tokens
    statistics.google.ai = {
      inputTokens: prevInput + inputTokens,
      outputTokens: prevOutput + outputTokens,
    };

    await statistics.save();
  } catch (error: unknown) {
    console.error(`updateLLMUsageStatisticsInDB`, error);
  }
};

export const updateTTSUsageStatisticsInDB = async ({
  userId,
  sttBilledTime,
}: {
  userId: string;
  sttBilledTime: number;
}) => {
  if (!sttBilledTime) return;
  let prevBilledTime = 0;

  const errMsg = `[updateTTSUsageStatisticsInDB]: Unable to update the statistics document in the db.`;
  if (!userId) {
    console.error(`${errMsg} Invalid user ID.`);
    return;
  }

  try {
    // Fetch the statistics document
    const statistics = await StatisticsModel.findOne({ userId });
    if (!statistics) {
      console.error(
        '[updateTTSUsageStatisticsInDB]: Unable to find the statistics document in the db.'
      );
      return;
    }

    const isStatsRelevant = checkIsStatisticsRelevant(statistics);
    if (isStatsRelevant) {
      prevBilledTime = statistics.google.sttBilledTime || 0;
    }

    // Update billed time
    statistics.google.sttBilledTime = prevBilledTime + sttBilledTime;
    await statistics.save();
  } catch (err: unknown) {
    console.error(`updateTTSUsageStatisticsInDB`, err);
  }
};

export const getChatSummary = async ({ userId }: { userId: string }) => {
  const errMsg = `[getChatSummary]: Unable to get the chat summary.`;
  if (!userId) {
    console.error(`${errMsg} Invalid user ID.`);
    return;
  }

  // Trying to get chat summary from the local map
  const summaryFromLocalMap = chatSummaryMap.get(userId);
  if (summaryFromLocalMap) return summaryFromLocalMap;

  try {
    // Trying to get chat summary from the db
    const chat = await ChatModel.findOne({ userId });
    if (!chat) return;

    return chat.summary || undefined;
  } catch (err: unknown) {
    console.error(errMsg, err);
  }
};

export const updateChatSummary = async ({
  userId,
  summary,
}: {
  userId: string;
  summary: string;
}) => {
  if (!summary) return;
  const errMsg = `[updateChatSummary]: Unable to update the chat summary.`;
  if (!userId) {
    console.error(`${errMsg} Invalid user ID.`);
    return;
  }

  // Update chat summary in the local map
  chatSummaryMap.set(userId, summary);

  // Update chat summary in the db
  try {
    const chat = await ChatModel.findOne({ userId });
    if (!chat) {
      console.error(
        '[updateChatSummary]: Unable to find the chat document in the db.'
      );
      return;
    }

    chat.summary = summary;
    chat.updTimestamp = Date.now();
    await chat.save();
  } catch (err: unknown) {
    console.error(errMsg, err);
  }
};

export const resetChatSummaryInDB = async ({
  userId,
}: {
  userId: string;
}): Promise<boolean> => {
  const errMsg = `[resetChatSummaryInDB]: Unable to reset chat summary in the db.`;
  if (!userId) {
    console.error(`${errMsg} Invalid user ID.`);
    return false;
  }

  try {
    // Fetch the chat document
    const chat = await ChatModel.findOne({ userId });
    if (!chat) {
      console.error(
        '[resetChatSummaryInDB]: Unable to find the chat document in the db.'
      );
      return false;
    }

    // Reset chat summary
    chat.summary = '';
    chat.updTimestamp = Date.now();
    await chat.save();
    return true;
  } catch (err: unknown) {
    console.error(errMsg, err);
    return false;
  }
};

/** Ask AI */

/**
 * Calculates the token count for large language models,
 * assuming 1 token ~= 4 characters on average.
 *
 * @param {string} text
 * @returns approximate number of tokens.
 */
export const calculateLLMTokens = (text: string) => {
  if (!text) return 0;
  return Math.round(text.length / 4);
};

/**
 * Generates a template for a question prompt that includes
 * instructions for the person being asked the question.
 */
export const createQuestionTemplate = ({
  instructions,
  history,
  language = 'English',
}: {
  instructions: string;
  history: string | null;
  language?: string;
}) => {
  const langInstructions =
    language !== 'English' ? `Use the ${language} language to answer.` : '';

  // Include the additional context from conversation history
  const historyContext = history
    ? `Use the following information as context:
${history}
`
    : '';

  return PromptTemplate.fromTemplate(`
${instructions}
Keep up the conversation using the provided context in a natural, human-like manner. Be concise. Don't tell the human that you are an AI for the rest of the conversation. Don't use markdown.
${langInstructions}
${historyContext}
---
Context: {context} 
Question: {question}
`);
};

/**
 * Serializes a chat history by formatting each message
 * based on its type (human, ai, or other).
 */
const serializeChatHistory = (chatHistory: ChatMessage[]): string => {
  return chatHistory
    .map((chatMessage: ChatMessage) => {
      if (chatMessage._getType() === 'human') {
        return `Human: ${chatMessage.content}`;
      } else if (chatMessage._getType() === 'ai') {
        return `AI: ${chatMessage.content}`;
      } else {
        return `${chatMessage.content}`;
      }
    })
    .join('\n');
};

/**
 * Processes input data to generate a response by utilizing
 * context, chat history, and question generation chains.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const performQuestionAnswering = async (input: any) => {
  let question = input.question;

  // Get the messages saved in the buffer memory
  const messageMemory = await input.data.messageMemory.loadMemoryVariables({});

  // logger.info('[performQA]: messageMemory', messageMemory);

  const hasHistory = messageMemory.chatHistory.length > 0;
  const chatHistory = hasHistory ? messageMemory.chatHistory : null;
  const chatHistoryLength = chatHistory?.length;

  // if (chatHistoryLength) {
  //   logger.info(`[performQA]: messages in history: ${chatHistoryLength}`);
  // }

  // Serialize context into strings
  const serializedDocs = formatDocumentsAsString(input.context);
  const context = serializedDocs.replace(/\r?\n|\r/g, ' ');

  // Split the long chat history to summarize old messages
  if (chatHistoryLength >= 11) {
    const oldMessages = chatHistory.slice(0, -2);
    const recentMessages = chatHistory.slice(-2);

    // Sort the old messages content
    const systemMessages: string[] = [];
    const humanMessages: string[] = [];
    const aiMessages: string[] = [];
    oldMessages.forEach((chatMessage: ChatMessage) => {
      const messageContent = chatMessage.content.toString();
      switch (chatMessage._getType()) {
        case 'system':
          systemMessages.push(messageContent);
          break;
        case 'human':
          humanMessages.push(messageContent);
          break;
        case 'ai':
          aiMessages.push(messageContent);
      }
    });

    const prevSummary = systemMessages.join(' ');
    const humanMessagesString = humanMessages.join(' ');
    const aiMessagesString = aiMessages.join(' ');
    // logger.info('prevSummary', prevSummary);
    // logger.info('humanMessagesString', humanMessagesString);
    // logger.info('aiMessagesString', aiMessagesString);

    const messages = `Human: ${humanMessagesString} \nAI: ${aiMessagesString}`;
    const { content: chatHistorySummary }: { content: MessageContent } =
      await summarizeChatHistoryChain.invoke({
        prevSummary,
        messages,
      });

    const summary = cleanIncompleteAnswer(chatHistorySummary as string);
    // logger.info(`Chat summary (origin): ${chatHistorySummary as string}`);
    // logger.info(`Chat summary (cleaned): ${summary}`);

    // Save aiChatHistorySummary in db
    updateChatSummary({
      userId: input.data.userId,
      summary,
    });

    // Update the chat history in the memory buffer
    input.data.messageMemory.chatHistory.clear();
    input.data.messageMemory.chatHistory = new ChatMessageHistory([
      new SystemMessage(`A concise summary of the conversation: ${summary}`),
      ...recentMessages, // The most recent pair of messages (Human, AI)
    ]);
  }

  // Parse chat history array to a string
  const chatHistoryString = chatHistory
    ? serializeChatHistory(chatHistory)
    : null;

  // Rephrase the question if the chat history includes 8 messages
  if (chatHistoryLength > 7 && chatHistoryString) {
    // Invoke the chain to generate a new question
    const { content } = await questionGeneratorChain.invoke({
      chatHistory: chatHistoryString,
      question: input.question,
    });
    question = content as string;
  }

  // logger.info('[performQA]: chatHistory', chatHistoryString);
  // logger.info('[performQA]: context', context);
  // logger.y('\n[performQA]: question', question);

  // Create the main chain
  const { chain, instructionTokens } = createMainChain({
    instructions: input.data.instructions,
    history: chatHistoryString,
    language: input.data.language,
  });

  // Ask AI using the main chain
  const { content } = await chain.invoke({
    context: context,
    question,
  });

  // content: MessageContent (string | MessageContentComplex[])
  const mainChainResult = content as string;

  // Save the LLM tokens count in the `user` document
  updateLLMUsageStatisticsInDB({
    userId: input.data.userId,
    instructionTokens,
    question,
    answer: mainChainResult,
  });

  // Get an alternative answer if not provided
  const answer = mainChainResult || getRandom(altAnswerList);

  // logger.info('[performQA]: answer', answer);

  // Save the pair of messages to the buffer memory
  await input.data.messageMemory.saveContext(
    { question: input.question },
    { answer: answer }
  );

  return {
    result: answer,
    sourceDocuments: input.context,
  };
};

export const createChainForCharacter = async ({
  character,
  userId,
  language,
}: {
  userId: string;
  character: Character;
  language?: string;
}) => {
  // Get a vector store for the person
  const vectorStore = await getVectorStoreForCharacter(character);
  if (!vectorStore) return { error: 'Could not create a vector store' };

  // Initialize a retriever wrapper around the vector store
  const retriever = vectorStore.asRetriever();

  // Get messages history from the buffer memory
  const messageMemory = await getMessageMemory({ userId });
  const messages = await messageMemory.chatHistory.getMessages();

  // Trying to get chat summary
  if (!messages.length) {
    const chatSummary = await getChatSummary({ userId });
    if (chatSummary) {
      // Update the chat history in the memory buffer
      messageMemory.chatHistory = new ChatMessageHistory([
        new SystemMessage(
          `A concise summary of the conversation: ${chatSummary}`
        ),
      ]);
    }
  }

  // Create the main cain
  const chain = RunnableSequence.from([
    {
      // Pass the question through unchanged
      question: (input) => input.question,
      // Fetch relevant context based on the question
      context: async (input) => retriever.invoke(input.question),
      data: () => ({
        userId,
        language,
        instructions: character.instructions,
        messageMemory,
      }),
    },
    performQuestionAnswering,
  ]);

  return { chain };
};
