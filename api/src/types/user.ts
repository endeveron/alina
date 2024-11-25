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

export type Statistics = {
  google: {
    ai: AIUsageStatistics;
    sttBilledTime: number;
  };
  updTimestamp: number;
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
