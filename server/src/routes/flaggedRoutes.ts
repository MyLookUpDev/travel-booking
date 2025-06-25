import { Router } from 'express';
import Flagged from '../models/Flagged';
import Booking from '../models/Booking';

const router = Router();

router.put('/:cin', async (req, res) => {
  const { cin } = req.params;
  const { redFlag } = req.body;

  try {
    // Update or insert the flag in Flagged collection
    const updated = await Flagged.findOneAndUpdate(
      { cin },
      { redFlag },
      { new: true, upsert: true }
    );

    // Propagate flag to ALL bookings of this CIN
    await Booking.updateMany(
      { cin },
      { $set: { flag: redFlag } }
    );

    return res.json({ message: 'Flag updated and propagated to bookings', updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Could not update flag', details: err });
  }
});

export default router;
