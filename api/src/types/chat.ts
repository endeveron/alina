export type GoogleSpeechToTextConfig = {
  encoding: 'LINEAR16' | 'AMR_WB';
  sampleRateHertz: number;
  languageCode: string;
};

export type SpeechToTextResData = {
  languageCode: string;
  requestId: string;
  transcript: string;
  totalBilledTime: number;
};
