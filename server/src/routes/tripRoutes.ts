import { Router } from 'express';
import Trip from '../models/Trip.js';
import multer from 'multer';
import path from 'path';

const router = Router();

// --- Multer configuration ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/'); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// --- Image upload endpoint ---
router.post('/upload', upload.single('image'), (req, res) => {
  // Will respond with the image's public URL (served from /uploads)
  const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.json({ imageUrl });
});

// Create trip
router.post('/', async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: 'Trip creation failed', details: err });
  }
});

// Get all trips
router.get('/', async (_req, res) => {
  const trips = await Trip.find().sort({ date: 1 });
  res.json(trips);
});

// Update trip
router.put('/:id', async (req, res) => {
  try {
    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTrip);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update trip', details: err });
  }
});

export default router;
