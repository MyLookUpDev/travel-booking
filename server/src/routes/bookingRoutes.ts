import { Router } from 'express'
import Booking from '../models/Booking' // ✅ Include .ts
import { authenticateJWT } from "../middleware/auth";

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

router.get("/", authenticateJWT, (req, res) => {
  // You can now use (req as any).user to access the user's info from the JWT
  res.json({ message: `Hello, ${(req as any).user.username}` });
})

export default router
