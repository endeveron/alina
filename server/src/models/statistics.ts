import { Schema, model } from 'mongoose';

import { Statistics } from '../types/statistics';

const statisticsSchema = new Schema<Statistics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
    },
    google: {
      ai: {
        inputTokens: { type: Number },
        outputTokens: { type: Number },
      },
      sttBilledTime: { type: Number },
    },
    updTimestamp: { type: Number },
  },
  {
    versionKey: false,
  }
);

statisticsSchema.index({
  userId: 'text',
});

const StatisticsModel = model<Statistics>('Statistics', statisticsSchema);
export default StatisticsModel;
