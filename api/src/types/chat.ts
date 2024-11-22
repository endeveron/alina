export type LangCode = 'en-US' | 'uk-UA';
export type LangCodeLower = 'en-us' | 'uk-ua';

export type GoogleSpeechToTextConfig = {
  encoding: 'LINEAR16' | 'AMR_WB';
  sampleRateHertz: number;
  langCode: LangCode;
};

export type AIUsageStatistics = {
  inputTokens: number;
  outputTokens: number;
};

export type GoogleGenAIResData = {
  answer: string;
  aiUsage: AIUsageStatistics;
};

export type SpeechToTextResData = {
  langCode: LangCodeLower;
  requestId: string;
  transcript: string;
  totalBilledTime: number;
};
