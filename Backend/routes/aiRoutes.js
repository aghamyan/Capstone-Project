import express from "express"
import { Schedule } from "../models/index.js"

const router = express.Router()

const parseMinutes = (time) => {
  if (!time) return null
  const [h, m] = time.split(":")
  const hours = Number.parseInt(h, 10)
  const minutes = Number.parseInt(m, 10)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null
  return hours * 60 + minutes
}

const formatMinutes = (value) => {
  const hours = Math.floor(value / 60)
    .toString()
    .padStart(2, "0")
  const minutes = (value % 60).toString().padStart(2, "0")
  return `${hours}:${minutes}`
}

const getFreeWindows = (schedules) => {
  const byDay = new Map()
  schedules.forEach((item) => {
    const list = byDay.get(item.day) || []
    list.push(item)
    byDay.set(item.day, list)
  })

  const windows = []
  for (const [day, items] of byDay.entries()) {
    const sorted = items.sort((a, b) => (a.starttime || "") < (b.starttime || "") ? -1 : 1)
    let cursor = 6 * 60
    sorted.forEach((block) => {
      const start = parseMinutes(block.starttime) ?? 6 * 60
      if (start > cursor) {
        windows.push({
          day,
          start: formatMinutes(cursor),
          end: formatMinutes(start),
          duration: start - cursor,
        })
      }
      const end = parseMinutes(block.endtime) ?? start + 45
      cursor = Math.max(cursor, end)
    })
    if (cursor < 22 * 60) {
      windows.push({
        day,
        start: formatMinutes(cursor),
        end: formatMinutes(22 * 60),
        duration: 22 * 60 - cursor,
      })
    }
  }
  return windows
}

router.post("/scheduler", async (req, res) => {
  try {
    const { userId, mode = "balanced" } = req.body
    if (!userId) return res.status(400).json({ error: "userId is required" })

    const schedules = await Schedule.findAll({
      where: { user_id: userId },
      order: [["day", "ASC"], ["starttime", "ASC"]],
      limit: 200,
    })

    const freeWindows = getFreeWindows(schedules)
    const prioritized = freeWindows.slice(0, 6).map((slot, index) => ({
      id: `${slot.day}-${index}`,
      title: index % 2 === 0 ? "Deep Work" : "Movement break",
      suggested_start: `${slot.day}T${slot.start}`,
      suggested_end: `${slot.day}T${slot.end}`,
      duration_minutes: slot.duration,
    }))

    const conflicts = []
    const byDay = new Map()
    schedules.forEach((item) => {
      const list = byDay.get(item.day) || []
      list.push(item)
      byDay.set(item.day, list)
    })
    for (const [day, list] of byDay.entries()) {
      list.sort((a, b) => (a.starttime || "") < (b.starttime || "") ? -1 : 1)
      let prev = null
      for (const entry of list) {
        if (prev) {
          const prevEnd = parseMinutes(prev.endtime) ?? parseMinutes(prev.starttime) ?? 0
          const start = parseMinutes(entry.starttime) ?? 0
          if (start < prevEnd) {
            conflicts.push({ day, first: prev, second: entry })
          }
        }
        prev = entry
      }
    }

    return res.json({ mode, suggestions: prioritized, freeWindows, conflicts })
  } catch (error) {
    console.error("AI scheduler error", error)
    return res.status(500).json({ error: "Unable to generate schedule suggestions" })
  }
})

export default router
