import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User";
import crypto from "crypto";
import nodemailer from "nodemailer";

const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "Printf.007";

const router = Router();

// Register
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body
    if (!username || !email || !password)
        return res.status(400).json({ message: "All fields required" })
    const exists = await User.findOne({ $or: [{ username }, { email }] })
    if (exists) return res.status(400).json({ message: "User exists" })

    const hashedPassword = await bcrypt.hash(password, 10)
    await User.create({ username, email, password: hashedPassword })
    res.status(201).json({ message: "User created" })
  } catch (err) {
    res.status(500).json({ message: "Server error" })
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }]
    });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET || "Printf.007",
      { expiresIn: "1d" }
    );
    res.json({ token });// send token to frontend
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }

  
});

// ====== Admin Create (NEW) ======
router.post("/create-admin", authenticateJWT, async (req, res) => {
  try {
    // Only admins can create another admin
    if ((req as any).user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields required" });
    const exists = await User.findOne({ $or: [{ username }, { email }] });
    if (exists) return res.status(400).json({ message: "User exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword, role: "admin" });
    res.status(201).json({ message: "Admin account created" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Auth middleware
export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).send("Unauthorized");
  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    (req as any).user = decoded;
    next();
  } catch {
    res.status(401).send("Unauthorized");
  }
}

// Admin check
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== "admin") return res.status(403).send("Forbidden");
  next();
}

// Delete admin (in auth.ts)
router.delete("/admins/:id", authenticateJWT, async (req, res) => {
  if ((req as any).user.role !== "admin") return res.status(403).json({ message: "Forbidden" });
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "Admin deleted" });
});

// Password reset - Request
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "No user with that email" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Setup nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      }
    });

    const resetUrl = `${frontendUrl}/reset-password/${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
    });

    res.json({ message: "Password reset email sent" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Password reset - Confirm
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });
    if (!user) return res.status(400).json({ message: "Invalid or expired token" });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.json({ message: "Password updated" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admins", authenticateJWT, async (req, res) => {
  try {
    if ((req as any).user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });
    const admins = await User.find({ role: "admin" }).select("username email");
    res.json(admins);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
