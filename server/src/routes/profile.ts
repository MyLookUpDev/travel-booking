import express from "express";
import User from "../models/User";
import { authenticateJWT } from "../routes/auth"; // or wherever your middleware is

const router = express.Router();

// GET /api/profile
router.get("/", authenticateJWT, async (req: any, res) => {
  const user = await User.findById(req.user.id).select("username email role cin phone address gender age");
  if (!user) return res.status(404).json({ message: "User not found" });
  res.json(user);
});

// PUT /api/profile
router.put("/", authenticateJWT, async (req: any, res) => {
  const { username, cin, phone, address, gender, age } = req.body;
  const updated = await User.findByIdAndUpdate(
    req.user.id,
    { username, cin, phone, address, gender, age },
    { new: true, runValidators: true }
  ).select("username email role cin phone address gender age");
  if (!updated) return res.status(404).json({ message: "User not found" });
  res.json(updated);
});

export default router;
