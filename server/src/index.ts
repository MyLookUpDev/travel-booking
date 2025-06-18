import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes';
import tripRoutes from './routes/tripRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

// ✅ Proper global CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

// ✅ Handle preflight requests explicitly (no path-to-regexp issues)
//app.options('/*', cors());

app.use(express.json());

app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/uploads', express.static('uploads'));

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
  });
