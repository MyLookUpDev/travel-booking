import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bookingRoutes from './routes/bookingRoutes.js' // ✅ Include .ts extension

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || ''

app.use(express.json())
app.use('/api/bookings', bookingRoutes)

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err)
  })
