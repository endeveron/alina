import { Schema, model } from 'mongoose';

import { Chat } from '../types/chat';

const chatSchema = new Schema<Chat>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: [true, 'User id is required'],
    },
    summary: { type: String },
    updTimestamp: { type: Number },
  },
  {
    versionKey: false,
  }
);

chatSchema.index({
  userId: 'text',
});

const ChatModel = model<Chat>('Chat', chatSchema);
export default ChatModel;
