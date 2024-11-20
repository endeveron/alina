import { ObjectId } from 'mongoose';

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
  // elevenlabs: {
  //   creditsUsed: number;
  //   updTimestamp: number;
  // };
  googleSpeechToText: {
    totalBilledTime: number;
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
