import express from "express"
import { TimeLog } from "../models/index.js"

const router = express.Router()

router.get("/sessions", async (req, res) => {
  try {
    const userId = Number(req.query.userId)
    if (!userId) return res.status(400).json({ error: "userId is required" })
    const sessions = await TimeLog.findAll({
      where: { user_id: userId },
      order: [["createdAt", "DESC"]],
      limit: 20,
    })
    return res.json(sessions)
  } catch (error) {
    console.error("focus sessions error", error)
    return res.status(500).json({ error: "Unable to fetch focus sessions" })
  }
})

router.post("/sessions", async (req, res) => {
  try {
    const { userId, scheduleId, durationMinutes, interruptions, mood, notes, status, output } = req.body
    if (!userId) return res.status(400).json({ error: "userId is required" })

    const session = await TimeLog.create({
      user_id: userId,
      schedule_id: scheduleId,
      duration_minutes: durationMinutes,
      interruptions: interruptions ?? 0,
      mood,
      notes,
      output,
      status: status || "completed",
      session_date: new Date(),
    })
    return res.json(session)
  } catch (error) {
    console.error("focus session save error", error)
    return res.status(500).json({ error: "Unable to save session" })
  }
})

export default router
