import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes';
import tripRoutes from './routes/tripRoutes';
import path from "path";
import whatsappNumberRoutes from "./routes/whatsappNumber";
import authRouter from "./routes/auth";
import "dotenv/config";
import flaggedRoutes from "./routes/flaggedRoutes";
import requestRoutes from './routes/requestRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || '';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

// CORS config
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://travel-booking-mu.vercel.app',
    "https://travel-booking-i4fh.onrender.com"
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', "Authorization"],
}));

app.use(express.json());

// Register API routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/trips', tripRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api/whatsapp-number", whatsappNumberRoutes);
app.use("/api/auth", authRouter);
app.use("/api/flags", flaggedRoutes);
app.use('/api/requests', requestRoutes);

// Serve frontend static files (optional, for combined prod deploy)
app.use(express.static(path.join(__dirname, "../../dist")));
app.get(/^\/(?!api).* /, (req, res) => {
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

