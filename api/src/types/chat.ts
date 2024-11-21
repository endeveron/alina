export type LanguageCode = 'en-US' | 'uk-UA';

export type GoogleSpeechToTextConfig = {
  encoding: 'LINEAR16' | 'AMR_WB';
  sampleRateHertz: number;
  languageCode: LanguageCode;
};

export type SpeechToTextResData = {
  languageCode: LanguageCode;
  requestId: string;
  transcript: string;
  totalBilledTime: number;
};
