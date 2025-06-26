import express from 'express';
import Request from '../models/Request';

const router = express.Router();

// POST: user submits a request
router.post('/', async (req, res) => {
  try {
    const reqDoc = await Request.create(req.body);
    res.status(201).json(reqDoc);
  } catch (err) {
    res.status(400).json({ error: 'Could not create request' });
  }
});

// GET: admin fetches all requests
router.get('/', async (_, res) => {
  const list = await Request.find().sort({ createdAt: -1 });
  res.json(list);
});

export default router;
