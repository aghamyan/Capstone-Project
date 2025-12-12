import express from "express";
import { createTask, listTasksByUser } from "../controllers/taskController.js";

const router = express.Router();

router.get("/", listTasksByUser);
router.get("/user/:userId", listTasksByUser);
router.post("/", createTask);

export default router;
