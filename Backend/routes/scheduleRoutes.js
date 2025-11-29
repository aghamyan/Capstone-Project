// routes/scheduleRoutes.js
import express from "express";
import {
  addSchedule,
  listUserSchedules,
  recommendSchedules,
  removeSchedule,
} from "../controllers/scheduleController.js";

const router = express.Router();

router.get("/user/:userId", listUserSchedules);
router.get("/user/:userId/recommendations", recommendSchedules);
router.post("/", addSchedule);
router.delete("/:id", removeSchedule);

export default router;
