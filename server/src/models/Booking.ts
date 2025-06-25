import mongoose from 'mongoose'

export interface IBooking extends Document {
  name: string;
  phone: string;
  destination: string;
  address: string;
  cin: string;
  date: string;
  gender: string;
  age: number;
  status: string;
  flag: boolean;
  comment: string;
  tripId: mongoose.Schema.Types.ObjectId;
}

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    destination: { type: String, required: true },
    address: { type: String, required: true },
    cin: { type: String, required: true },
    date: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected'], default: 'pending' },
    flag: { type: Boolean, default: false },
    comment: { type: String },
    tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true }
  },
  { timestamps: true }
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
