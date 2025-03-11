import { Schema } from 'mongoose';
import { AIUsageStatistics } from './statistics';

export type LangCode = 'en-US' | 'uk-UA';
export type LangCodeLower = 'en-us' | 'uk-ua';

export type GoogleSpeechToTextConfig = {
  encoding: 'LINEAR16' | 'AMR_WB';
  sampleRateHertz: number;
  langCode: LangCode;
};

export type GoogleGenAIResData = {
  answer: string;
  aiUsage: AIUsageStatistics;
};

export type SpeechToTextResData = {
  langCode: LangCodeLower;
  requestId: string;
  transcript: string;
  billedTime: number;
};

/** Character (AI) */

export enum Gender {
  male = 'male',
  female = 'female',
}

export enum CharacterKey {
  main = 'main',
}

export enum MessageRole {
  system = 'system',
  human = 'human',
  ai = 'ai',
}

export type CharacterBaseData = {
  key: CharacterKey;
  gender: Gender;
};

export type Character = CharacterBaseData & {
  instructions: string;
  context: string[];
};

/** Chat document */

export type Chat = {
  userId: Schema.Types.ObjectId;
  summary: string;
  updTimestamp: number;
};
