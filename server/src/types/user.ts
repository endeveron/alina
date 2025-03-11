import { ObjectId } from 'mongoose';
import { AIUsageStatistics } from './statistics';

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
};

export type AuthData = {
  id: string;
  account: Omit<UserAccount, 'password'>;
};
