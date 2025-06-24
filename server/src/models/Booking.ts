import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    destination: { type: String, required: true },
    address: { type: String, required: true },
    cin: { type: String, required: true },
    date: { type: String, required: true },
    gender: { type: String, required: true },
    age: { type: Number, required: true }
  },
  { timestamps: true }
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking
