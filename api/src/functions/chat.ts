import { GoogleSpeechToTextConfig } from '../types/chat';

export const speechToText = async ({
  config,
  recordingBase64,
}: {
  config: GoogleSpeechToTextConfig;
  recordingBase64: string;
}) => {};

export const askAi = async () => {};

export const textToSpeech = async ({ text }: { text: string }) => {};
