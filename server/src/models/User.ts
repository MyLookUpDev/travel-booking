import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin";
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
}

const userSchema = new Schema<IUser>({
  username: { type: String, unique: true, required: true },
  email:    { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ["user", "admin"], default: "user" },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

export default model<IUser>("User", userSchema);
