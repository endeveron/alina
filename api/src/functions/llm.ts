import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Result } from '../types/common';
import { GoogleGenAIResData } from '../types/chat';

// Create a llm model instance
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_AI_STUDIO_API_KEY,
  model: 'gemini-1.5-flash-8b',
  maxRetries: 2,
  maxOutputTokens: 30, // 120 characters
  temperature: 1,
  safetySettings: [
    {
      // See: https://ai.google.dev/gemini-api/docs/safety-settings
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_NONE,
    },
  ],
});

export const askGoogleGenAI = async ({
  instructions,
  question,
}: {
  instructions: string;
  question: string;
}): Promise<Result<GoogleGenAIResData>> => {
  try {
    const aiResponse = await llm.invoke([
      ['system', instructions],
      ['human', question],
    ]);

    const answer = (aiResponse.content as string).replace(/\n/g, '');
    const usageData = aiResponse.usage_metadata;

    const data: GoogleGenAIResData = {
      answer,
      aiUsage: {
        inputTokens: usageData?.input_tokens ?? 0,
        outputTokens: usageData?.output_tokens ?? 0,
      },
    };

    // console.log(`AI answer: "${answer}"`);
    // console.log('AI usage:', data.aiUsage);

    return {
      data,
      error: null,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`askGoogleGenAI ${err.message}`);
      return {
        data: null,
        error: { message: err.message ?? 'askGoogleGenAI error' },
      };
    }
    // If err is not an instance of Error, handle it accordingly
    console.error('askGoogleGenAI Unknown error', err);
    return {
      data: null,
      error: { message: 'askGoogleGenAI error' },
    };
  }
};
