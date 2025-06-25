import { Router } from 'express'
import Booking from '../models/Booking' // ✅ Include .ts
import { authenticateJWT } from "../middleware/auth";
import Trip from '../models/Trip';
import Flagged from '../models/Flagged'; 

const router = Router()

router.get('/', async (_req, res) => {
  const bookings = await Booking.find().sort({ createdAt: -1 })
  res.json(bookings)
})

router.post('/', async (req, res) => {
  try {
    const booking = new Booking(req.body)
    const flagDoc = await Flagged.findOne({ cin: booking.cin });
    booking.flag = Boolean(flagDoc?.redFlag);
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

// Delete booking (in bookingRoutes.ts)
router.delete("/:id", authenticateJWT, async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  res.json({ message: "Booking deleted" });
});

// Adjust seat numbers
router.put('/:id/status', async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, flag, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Find the related trip
    const trip = await Trip.findById(booking.tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    // Handle seat logic
    const oldStatus = booking.status;
    // Confirming a booking (from pending or rejected)
    if (
      (oldStatus === 'pending' || oldStatus === 'rejected') &&
      status === 'confirmed'
    ) {
      if (trip.seats <= 0) {
        return res.status(400).json({ message: 'No seats available' });
      }
      trip.seats -= 1;
      await trip.save();
    }
    // Un-confirming a booking (confirmed -> pending or confirmed -> rejected)
    else if (
      oldStatus === 'confirmed' &&
      (status === 'pending' || status === 'rejected')
    ) {
      trip.seats += 1;
      await trip.save();
    }
    // All other status changes: no seat change

    booking.status = status;
    booking.flag = flag;
    booking.comment = comment;
    await booking.save();

    res.json({ booking, trip });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
});

export default router
