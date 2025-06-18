import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true },
    date: { type: String, required: true },
    seats: { type: Number, required: true },
    gender: { type: String, enum: ['all', 'female'], default: 'all' },
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
