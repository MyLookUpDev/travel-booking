import { Router } from "express";
import Setting from "../models/Setting";
const router = Router();

// GET current WhatsApp number
router.get("/", async (req, res) => {
  const setting = await Setting.findOne({ key: "whatsappNumber" });
  res.json({ number: setting?.value || "" });
});

// POST update WhatsApp number
router.post("/", async (req, res) => {
  const { number } = req.body;
  await Setting.findOneAndUpdate(
    { key: "whatsappNumber" },
    { value: number },
    { upsert: true }
  );
  res.json({ number });
});

export default router;
