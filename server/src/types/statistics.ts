import { ObjectId } from 'mongoose';

export type AIUsageStatistics = {
  inputTokens: number;
  outputTokens: number;
};

export type Statistics = {
  userId: ObjectId;
  google: {
    ai: AIUsageStatistics;
    sttBilledTime: number;
  };
  updTimestamp: number;
};
