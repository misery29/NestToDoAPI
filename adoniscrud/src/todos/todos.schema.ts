import { Schema, Document, Types } from 'mongoose';

export interface TodoDoc extends Document {
  title: string;
  done: boolean;
  owner: Types.ObjectId;
}

export const TodoSchema = new Schema<TodoDoc>({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});