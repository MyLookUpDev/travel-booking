import { Router } from 'express';
import { authenticateJWT } from '../middleware/auth';
import Flagged from '../models/Flagged';

const router = Router();

// Only admins may use this
router.use(authenticateJWT);
router.use((req, res, next) => {
  if ((req as any).user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
});

// Get list of all flagged CINs
router.get('/', async (_, res) => {
  const all = await Flagged.find().sort('cin');
  res.json(all);
});

// Upsert a flag for one CIN
router.put('/:cin', async (req, res) => {
  const { cin } = req.params;
  const { redFlag } = req.body as { redFlag: boolean };

  const updated = await Flagged.findOneAndUpdate(
    { cin },
    { redFlag },
    { new: true, upsert: true }
  );
  res.json(updated);
});

export default router;
