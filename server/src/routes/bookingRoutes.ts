import { Router } from 'express'
import Booking from '../models/Booking.js' // ✅ Include .ts

const router = Router()

router.get('/', async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 })
  res.json(bookings)
})

router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body)
    await booking.save()
    res.status(201).json(booking)
  } catch (err) {
    res.status(400).json({ error: 'Booking failed', details: err })
  }
})

export default router
