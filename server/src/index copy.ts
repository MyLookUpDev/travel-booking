
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes.js';
import tripRoutes from './routes/tripRoutes.js';
import authRoutes from './routes/authRoutes.js';
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

void authRoutes;

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
//app.use('/api/auth', authRoutes);

// Serve frontend static files
app.use(express.static(path.join(__dirname, "../dist"))); // Adjust path if dist is not at root

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
  });
