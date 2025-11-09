import express from "express";
import multer from "multer";
import path from "path";
import { User } from "../models/index.js";
import fs from "fs";

const router = express.Router();

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"), false);
    cb(null, true);
  },
});

// POST /api/avatar/:userId
router.post("/:userId", upload.single("avatar"), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

    // Delete old avatar (skip default)
    if (user.avatar && !user.avatar.includes("default-avatar.png")) {
      const oldFile = user.avatar.replace(/^\/+/, "");
      if (fs.existsSync(oldFile)) fs.unlinkSync(oldFile);
    }

    // Save new avatar path in DB
    user.avatar = `/uploads/${req.file.filename}`;
    await user.save();

    res.json({ success: true, imagePath: user.avatar });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
