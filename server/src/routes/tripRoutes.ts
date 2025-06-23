import { Router } from 'express';
import Trip from '../models/Trip';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: 'Trip creation failed', details: err });
  }
});

router.get('/', async (_req, res) => {
  const trips = await Trip.find().sort({ date: 1 });
  res.json(trips);
});

// PUT /api/trips/:id
router.put('/:id', async (req, res) => {
  try {
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip', details: err });
  }
});


// Delete trip (in tripRoutes.ts)
router.delete("/:id", authenticateJWT, async (req, res) => {
  // Only allow admins!
  await Trip.findByIdAndDelete(req.params.id);
  res.json({ message: "Trip deleted" });
});

export default router;
