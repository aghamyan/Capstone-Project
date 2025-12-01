import express from "express"
import { Op } from "sequelize"
import { Schedule, TimeLog, WeeklyReview } from "../models/index.js"

const router = express.Router()

const startOfWeek = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff))
}

router.post("/generate", async (req, res) => {
  try {
    const { userId } = req.body
    if (!userId) return res.status(400).json({ error: "userId is required" })

    const since = new Date()
    since.setDate(since.getDate() - 7)
    const [logs, schedules] = await Promise.all([
      TimeLog.findAll({ where: { user_id: userId, session_date: { [Op.gte]: since } } }),
      Schedule.findAll({ where: { user_id: userId, day: { [Op.gte]: since.toISOString().split("T")[0] } } }),
    ])

    const totalMinutes = logs.reduce((acc, log) => acc + (log.duration_minutes || 0), 0)
    const missed = logs.filter((log) => log.status === "missed").length
    const highlights = schedules.slice(0, 3).map((sched) => sched.custom_title || sched.notes || "Habit block")

    return res.json({
      summary: {
        totalMinutes,
        missed,
        highlights,
      },
      prompts: [
        "What energized you most this week?",
        "Where did interruptions come from?",
        "Which habit deserves more time next week?",
      ],
      suggestions: {
        focus: "Double down on the morning deep work streak.",
        wellBeing: "Schedule a mid-week reset with movement.",
        automation: "Use templates for your recurring study sessions.",
      },
    })
  } catch (error) {
    console.error("review generate error", error)
    return res.status(500).json({ error: "Unable to generate weekly review" })
  }
})

router.post("/save", async (req, res) => {
  try {
    const { userId, weekStart, reflections, draft } = req.body
    if (!userId || !weekStart) return res.status(400).json({ error: "userId and weekStart are required" })

    const review = await WeeklyReview.create({
      user_id: userId,
      week_start: weekStart,
      reflections,
      draft_plan: draft,
      summary: { savedAt: new Date().toISOString() },
    })

    return res.json(review)
  } catch (error) {
    console.error("review save error", error)
    return res.status(500).json({ error: "Unable to save review" })
  }
})

router.get("/get", async (req, res) => {
  try {
    const userId = Number(req.query.userId)
    if (!userId) return res.status(400).json({ error: "userId is required" })
    const reviews = await WeeklyReview.findAll({
      where: { user_id: userId },
      order: [["week_start", "DESC"]],
      limit: 12,
    })
    return res.json(reviews)
  } catch (error) {
    console.error("review fetch error", error)
    return res.status(500).json({ error: "Unable to fetch reviews" })
  }
})

export default router
