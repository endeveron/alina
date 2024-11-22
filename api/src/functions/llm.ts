import { HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { Result } from '../types/common';
import { GoogleGenAIResData } from '../types/chat';

// Create a llm model instance
const llm = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY,
  model: 'gemini-1.5-flash-8b',
  maxRetries: 2,
  maxOutputTokens: 20, // 80 characters ~ 10-15 words
  temperature: 0.8,
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

    console.log(`AI answer: "${answer}"`);
    console.log('AI usage:', data.aiUsage);

    return {
      data,
      error: null,
    };
  } catch (err: any) {
    console.error(`askGoogleGenAI ${err}`);
    return {
      data: null,
      error: err.message ?? 'askGoogleGenAI error',
    };
  }
};
