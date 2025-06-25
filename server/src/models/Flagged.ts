import mongoose, { Document, Schema } from 'mongoose';

export interface IFlagged extends Document {
  cin: string;
  redFlag: boolean;
}

const flaggedSchema = new Schema<IFlagged>({
  cin:     { type: String, unique: true, required: true },
  redFlag: { type: Boolean, default: true },   // whenever a doc exists, it means “flagged”
});

export default mongoose.model<IFlagged>('Flagged', flaggedSchema);
