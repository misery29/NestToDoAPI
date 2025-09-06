import { Schema, Document } from 'mongoose';

export interface UserDoc extends Document {
  name: string;
  email: string;
  password: string; // bcrypt hash
  currentHashedRefreshToken?: string | null;
}

export const UserSchema = new Schema<UserDoc>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  currentHashedRefreshToken: { type: String, default: null },
});