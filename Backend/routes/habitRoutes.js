// routes/habitRoutes.js
import express from "express";
import {
  createHabit,
  getHabitsByUser,
  updateHabit,
  removeHabit,
  generateHabitSuggestion,
} from "../controllers/habitController.js";

const router = express.Router();

router.get("/", getHabitsByUser);
router.get("/user/:userId", getHabitsByUser);
router.post("/", createHabit);
router.post("/ai-suggest", generateHabitSuggestion);
router.put("/:id", updateHabit);
router.delete("/:id", removeHabit);

export default router;
