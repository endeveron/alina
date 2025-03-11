import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

import {
  questionGeneratorTemplate,
  summarizeChatHistoryTemplate,
} from '../data/prompts';
import { calculateLLMTokens, createQuestionTemplate } from './chat';

const googleLLMBaseSettings = {
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-1.5-flash-8b',
  maxRetries: 2,
};

// Create the main llm model instance
const googleLLM = new ChatGoogleGenerativeAI({
  maxOutputTokens: 32, // ~ 128 characters
  temperature: 1,
  safetySettings: [
    {
      // See: https://ai.google.dev/gemini-api/docs/safety-settings
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
  ...googleLLMBaseSettings,
});

// Create the summary LLM instance
const googleSummaryLLM = new ChatGoogleGenerativeAI({
  maxOutputTokens: 64, // ~ 256 characters
  temperature: 0.5,
  ...googleLLMBaseSettings,
});

// This chain is used to generate a new question based on the
// provided chat history, context, and an initial question.
export const questionGeneratorChain =
  questionGeneratorTemplate.pipe(googleSummaryLLM);

// This chain is used to summarize the old chat messages
export const summarizeChatHistoryChain =
  summarizeChatHistoryTemplate.pipe(googleSummaryLLM);

/** This chain is used for question answering based on
 *  the provided context and the question */
export const createMainChain = ({
  instructions,
  history,
  language,
}: {
  instructions: string;
  history: string | null;
  language?: string;
}) => {
  // Configure the question template
  const questionTemplate = createQuestionTemplate({
    instructions,
    history,
    language,
  });

  // logger.b('[createMainChain]: question', questionTemplate.template);

  const questionTemplateStr = questionTemplate.template.toString();
  const query = questionTemplateStr.concat(history ?? '');
  const chain = questionTemplate.pipe(googleLLM);
  const instructionTokens = calculateLLMTokens(query);

  return {
    chain,
    instructionTokens,
  };
};
