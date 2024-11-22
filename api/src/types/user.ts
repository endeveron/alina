import { ObjectId } from 'mongoose';
import { AIUsageStatistics } from './chat';

type UserAccount = {
  name: string;
  email: string;
  password: string;
  role: {
    index: number;
    name: string;
  };
};

type Statistics = {
  google: {
    speechToText: {
      totalBilledTime: number;
    };
    textToSpeech: {
      totalCharacters: number;
    };
    ai: AIUsageStatistics;
    updTimestamp: number;
  };
};

export type User = {
  _id: ObjectId;
  account: UserAccount;
  statistics: Statistics;
};

export type AuthData = {
  id: string;
  account: Omit<UserAccount, 'password'>;
};
