import { useEffect, useMemo, useState } from "react"
import { fetchCalendarOverview } from "../services/calendar"
import { getSchedules } from "../services/schedules"
import {
  fetchAiSuggestions,
  fetchFocusSessions,
  fetchTimeInsights,
  fetchWeeklyReviews,
  generateWeeklyReview,
} from "../services/planner"

const parseDuration = (start, end) => {
  if (!start || !end) return 0
  const [sh, sm] = start.split(":")
  const [eh, em] = end.split(":")
  return Math.max(0, (Number(eh) * 60 + Number(em)) - (Number(sh) * 60 + Number(sm)))
}

export const usePlannerData = (userId) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [calendarOverview, setCalendarOverview] = useState(null)
  const [aiData, setAiData] = useState(null)
  const [insights, setInsights] = useState(null)
  const [sessions, setSessions] = useState([])
  const [reviews, setReviews] = useState([])
  const [draftReview, setDraftReview] = useState(null)

  useEffect(() => {
    const load = async () => {
      if (!userId) {
        setError("Please log in to view Planner data")
        setLoading(false)
        return
      }
      try {
        setLoading(true)
        const [scheduleData, calendarData, aiSuggestions, insightSummary, sessionData, reviewDraft, reviewHistory] =
          await Promise.all([
            getSchedules(userId),
            fetchCalendarOverview(userId, { days: 30 }),
            fetchAiSuggestions(userId, "balanced"),
            fetchTimeInsights(userId),
            fetchFocusSessions(userId),
            generateWeeklyReview(userId),
            fetchWeeklyReviews(userId),
          ])
        setSchedules(Array.isArray(scheduleData) ? scheduleData : [])
        setCalendarOverview(calendarData)
        setAiData(aiSuggestions)
        setInsights(insightSummary)
        setSessions(Array.isArray(sessionData) ? sessionData : [])
        setDraftReview(reviewDraft)
        setReviews(Array.isArray(reviewHistory) ? reviewHistory : [])
      } catch (err) {
        console.error(err)
        setError(err.message || "Unable to load planner data")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [userId])

  const scheduleStats = useMemo(() => {
    const today = new Date().toISOString().split("T")[0]
    const todayBlocks = schedules.filter((s) => s.day === today)
    const totalFocusMinutes = todayBlocks.reduce(
      (acc, block) => acc + parseDuration(block.starttime, block.endtime || block.starttime),
      0
    )
    const conflicts = []
    todayBlocks
      .sort((a, b) => (a.starttime || "").localeCompare(b.starttime || ""))
      .reduce((prev, curr) => {
        if (prev) {
          const prevEnd = prev.endtime || prev.starttime
          if (prevEnd && curr.starttime && prevEnd > curr.starttime) conflicts.push({ first: prev, second: curr })
        }
        return curr
      }, null)

    const days = schedules.reduce((acc, sched) => {
      if (!sched.day) return acc
      acc[sched.day] = acc[sched.day] || { count: 0, minutes: 0 }
      acc[sched.day].count += 1
      acc[sched.day].minutes += parseDuration(sched.starttime, sched.endtime || sched.starttime)
      return acc
    }, {})
    const values = Object.entries(days)
    const bestDay = values.sort((a, b) => b[1].minutes - a[1].minutes)[0]
    const weakestDay = values.sort((a, b) => a[1].minutes - b[1].minutes)[0]

    return {
      todayBlocks,
      conflicts,
      totalFocusMinutes,
      freeWindows: aiData?.freeWindows || [],
      summary: {
        totalFocusHours: Math.round(totalFocusMinutes / 60),
        busyDays: values.filter(([, info]) => info.count >= 3).length,
        emptyDays: values.filter(([, info]) => info.count === 0).length,
        bestDay: bestDay ? { day: bestDay[0], minutes: bestDay[1].minutes } : null,
        weakestDay: weakestDay ? { day: weakestDay[0], minutes: weakestDay[1].minutes } : null,
      },
    }
  }, [aiData?.freeWindows, schedules])

  return {
    loading,
    error,
    schedules,
    calendarOverview,
    aiData,
    insights,
    sessions,
    reviews,
    draftReview,
    scheduleStats,
  }
}
