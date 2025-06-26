// server/models/Request.ts
import mongoose from 'mongoose';

const requestSchema = new mongoose.Schema({
  name: String,
  cin: String,
  phone: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Request', requestSchema);
