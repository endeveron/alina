export enum LangCode {
  en = 'en-US',
  uk = 'uk-UA',
}

export type ChatConfig = {
  langCode: string;
  isGreet: boolean;
  isAIMessagesTranscript: boolean;
};

export type TranscriptionAlternative = {
  confidence: number;
  transcript: string;
};

export type GoogleSpeechToTextConfig = {
  encoding: string;
  sampleRateHertz: number;
  languageCode: string;
};

export type AskAIResData = {
  // audioUrl: string;
  humanMessage: string;
  aiMessage: string;
};
