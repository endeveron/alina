export enum LangCode {
  en = 'en-US',
  uk = 'uk-UA',
}

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
  audioUrl: string;
  humanTranscript: string;
  aiTranscript: string;
};
