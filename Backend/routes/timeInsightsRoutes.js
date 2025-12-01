import express from "express"
import { Op } from "sequelize"
import { Schedule, TimeLog } from "../models/index.js"

const router = express.Router()

router.get("/summary", async (req, res) => {
  try {
    const userId = Number(req.query.userId)
    if (!userId) return res.status(400).json({ error: "userId is required" })

    const [timeLogs, schedules] = await Promise.all([
      TimeLog.findAll({ where: { user_id: userId }, order: [["session_date", "DESC"]], limit: 120 }),
      Schedule.findAll({ where: { user_id: userId, day: { [Op.not]: null } } }),
    ])

    const totals = timeLogs.reduce(
      (acc, entry) => {
        acc.completed += entry.duration_minutes || 0
        if (entry.status === "cancelled") acc.cancelled += 1
        if (entry.status === "missed") acc.missed += 1
        return acc
      },
      { completed: 0, cancelled: 0, missed: 0 }
    )

    const habitCounts = {}
    schedules.forEach((item) => {
      const key = item.habit_id || "custom"
      habitCounts[key] = (habitCounts[key] || 0) + 1
    })

    const workloadByDay = schedules.reduce((acc, sched) => {
      if (!sched.day) return acc
      const start = sched.starttime ? Number(sched.starttime.split(":")[0]) : 0
      const end = sched.endtime ? Number(sched.endtime.split(":")[0]) : start
      const hours = Math.max(0, end - start)
      acc[sched.day] = (acc[sched.day] || 0) + hours
      return acc
    }, {})

    const heatmap = timeLogs.map((log) => ({
      date: log.session_date,
      duration: log.duration_minutes,
      mood: log.mood,
    }))

    const overbooked = Object.values(workloadByDay).filter((h) => h > 10).length

    return res.json({
      totals,
      habitCounts,
      workloadByDay,
      heatmap,
      overbookedDays: overbooked,
      recentSessions: timeLogs.slice(0, 8),
    })
  } catch (error) {
    console.error("time insights error", error)
    return res.status(500).json({ error: "Unable to load time insights" })
  }
})

export default router
