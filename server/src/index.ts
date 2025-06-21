import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS config
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://travel-booking-mu.vercel.app'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Register API routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/uploads', express.static('uploads'));

// Serve frontend static files (optional, for combined prod deploy)
app.use(express.static(path.join(__dirname, "../../dist")));
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "..","..","dist","index.html"));
});

// Start server after connecting to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
  });
