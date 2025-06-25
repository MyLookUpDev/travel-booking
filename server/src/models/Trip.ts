import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    destination: { type: String, required: true },
    date: { type: String, required: true },
    seats: { type: Number, required: true },
    gender: { type: String, required: true },
    activities: { type: Array },
    price: { type: Number, required: false }, // ← Add this line!
    image: { type: String, required: false }, // (if you have images already)
    profit: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Trip = mongoose.model('Trip', tripSchema);

export default Trip;
