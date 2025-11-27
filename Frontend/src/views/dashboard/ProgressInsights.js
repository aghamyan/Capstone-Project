import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormInput,
  CInputGroup,
  CListGroup,
  CListGroupItem,
  CProgress,
  CProgressBar,
  CRow,
  CSpinner,
} from "@coreui/react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { getHabits } from "../../services/habits"
import { formatPercent, getProgressAnalytics } from "../../services/analytics"
import {
  getTodayProgressLogs,
  logHabitProgress,
  updateHabitProgressCount,
} from "../../services/progress"

const SummaryCard = ({ title, value, subtitle }) => (
  <CCard className="h-100 bg-body-tertiary">
    <CCardBody className="text-center">
      <div className="text-body-secondary small text-uppercase mb-1">{title}</div>
      <div className="display-6">{value}</div>
      {subtitle && <div className="text-body-secondary small">{subtitle}</div>}
    </CCardBody>
  </CCard>
)

const CountAdjuster = ({ label, value, color, disabled, onIncrement, onDecrement }) => (
  <div className="d-flex flex-column gap-2 flex-fill">
    <div className="d-flex justify-content-between align-items-center">
      <span className="text-body-secondary text-uppercase small">{label}</span>
      <CBadge color={color} className="px-3 py-2 fw-semibold">
        {value}
      </CBadge>
    </div>
    <CInputGroup size="sm">
      <CButton color={color} variant="outline" disabled={disabled || value === 0} onClick={onDecrement}>
        −
      </CButton>
      <CFormInput value={value} readOnly className="text-center" />
      <CButton color={color} variant="outline" disabled={disabled} onClick={onIncrement}>
        +
      </CButton>
    </CInputGroup>
  </div>
)

const formatDate = (date) => {
  if (!date) return "—"
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return date
  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

const statusBadgeColor = (rate) => {
  if (rate >= 80) return "success"
  if (rate >= 50) return "warning"
  return "danger"
}

const ProgressInsights = () => {
  const [habits, setHabits] = useState([])
  const [progress, setProgress] = useState({})
  const [todayCounts, setTodayCounts] = useState({})
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = user?.id

  const todayIso = useMemo(() => new Date().toISOString().split("T")[0], [])

  useEffect(() => {
    if (!userId) {
      setError("Please login to view and log progress.")
      setLoading(false)
      return
    }

    const init = async () => {
      try {
        const [habitData, analyticsData] = await Promise.all([
          getHabits(userId),
          getProgressAnalytics(userId),
        ])
        setHabits(habitData)
        setAnalytics(analyticsData)
        await loadTodayCounts()
        setError("")
      } catch (err) {
        console.error("Failed to load insights", err)
        setError("Unable to load your progress right now.")
      } finally {
        setLoading(false)
      }
    }

    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const loadTodayCounts = useCallback(async () => {
    if (!userId) return
    try {
      const rows = await getTodayProgressLogs(userId)
      const counts = rows.reduce((acc, row) => {
        const hid = row.habit_id
        if (!acc[hid]) {
          acc[hid] = { done: 0, missed: 0 }
        }
        if (row.status === "done") acc[hid].done += 1
        if (row.status === "missed") acc[hid].missed += 1
        return acc
      }, {})
      setTodayCounts(counts)
    } catch (err) {
      console.error("Failed to load today's counts", err)
      setError("Unable to load today's check-ins.")
    }
  }, [userId])

  const refreshAnalytics = useCallback(async () => {
    if (!userId) return
    try {
      const payload = await getProgressAnalytics(userId)
      setAnalytics(payload)
    } catch (err) {
      console.error("Failed to refresh analytics", err)
    }
  }, [userId])

  const markStatus = async (habitId, status) => {
    if (!userId) return
    try {
      setSaving(true)
      const data = await logHabitProgress(habitId, { userId, status })
      setProgress((prev) => ({ ...prev, [habitId]: data.row?.status || status }))
      await Promise.all([refreshAnalytics(), loadTodayCounts()])
      setError("")
    } catch (actionErr) {
      console.error("Failed to update progress", actionErr)
      setError("Failed to update progress")
    } finally {
      setSaving(false)
    }
  }

  const updateCount = async (habitId, status, nextValue) => {
    if (!userId) return
    try {
      setSaving(true)
      const payload = await updateHabitProgressCount(habitId, {
        userId,
        status,
        targetCount: nextValue,
        date: todayIso,
      })
      setTodayCounts((prev) => ({
        ...prev,
        [habitId]: payload.counts,
      }))
      setProgress((prev) => ({ ...prev, [habitId]: status }))
      await refreshAnalytics()
      setError("")
    } catch (updateErr) {
      console.error("Failed to adjust progress", updateErr)
      setError("Failed to adjust today's count")
    } finally {
      setSaving(false)
    }
  }

  const changeCountByDelta = (habitId, status, delta) => {
    const currentCounts = todayCounts[habitId] || { done: 0, missed: 0 }
    const currentValue = currentCounts[status] || 0
    const nextValue = Math.max(0, currentValue + delta)
    if (nextValue === currentValue) return
    updateCount(habitId, status, nextValue)
  }

  const habitStatsMap = useMemo(() => {
    if (!analytics?.habits) return {}
    return analytics.habits.reduce((acc, item) => {
      acc[item.habitId] = item
      return acc
    }, {})
  }, [analytics])

  const summary = analytics?.summary
  const dailyTrend = summary?.dailyTrend ?? []
  const recentDaily = useMemo(() => dailyTrend.slice(-7), [dailyTrend])
  const leaderboard = summary?.habitLeaderboard ?? []

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h2 className="mb-0">Progress & Insights</h2>
          <div className="text-body-secondary small">
            Stay on top of momentum, streaks, and today's check-ins.
          </div>
        </div>
        {error && <CAlert color="danger" className="mb-0">{error}</CAlert>}
      </div>

      <CRow className="g-3 mb-4">
        <CCol xs={12} md={6} xl={3}>
          <SummaryCard
            title="Completion rate"
            value={formatPercent(summary?.completionRate ?? 0)}
            subtitle={
              summary?.totalCheckIns
                ? `${summary.totalDone} done · ${summary.totalMissed} missed`
                : "Log a check-in to begin"
            }
          />
        </CCol>
        <CCol xs={12} md={6} xl={3}>
          <SummaryCard
            title="Longest streak"
            value={summary?.streakLeader ? `${summary.streakLeader.streak.best} days` : "0 days"}
            subtitle={summary?.streakLeader ? summary.streakLeader.habitName : "Stay consistent to build streaks"}
          />
        </CCol>
        <CCol xs={12} md={6} xl={3}>
          <SummaryCard
            title="Most productive day"
            value={summary?.peakDay ? formatDate(summary.peakDay.date) : "—"}
            subtitle={
              summary?.peakDay
                ? `${summary.peakDay.completed} completions`
                : "Track activity to discover yours"
            }
          />
        </CCol>
        <CCol xs={12} md={6} xl={3}>
          <SummaryCard
            title="Active habits"
            value={summary?.totalHabits ?? habits.length}
            subtitle={habits.length ? `${habits.length} tracked` : "Add a habit to get started"}
          />
        </CCol>
      </CRow>

      <CRow className="g-4 mb-4">
        <CCol xs={12} lg={7}>
          <CCard className="h-100">
            <CCardHeader className="fw-semibold">Recent momentum (last 7 days)</CCardHeader>
            <CCardBody style={{ height: 280 }}>
              {recentDaily.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={recentDaily}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis allowDecimals={false} />
                    <Tooltip labelFormatter={formatDate} />
                    <Legend />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke="#2eb85c" fill="#2eb85c33" />
                    <Area type="monotone" dataKey="missed" name="Missed" stroke="#e55353" fill="#e5535333" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-body-secondary text-center my-5">
                  Keep logging progress to see your weekly momentum.
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={12} lg={5}>
          <CCard className="h-100">
            <CCardHeader className="fw-semibold">Consistency leaders</CCardHeader>
            <CCardBody style={{ height: 280 }}>
              {leaderboard.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={leaderboard}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="habitName" hide />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => `${value}% success`} labelFormatter={(label) => label} />
                    <Legend />
                    <Bar dataKey="successRate" name="Success rate" fill="#39f" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-body-secondary text-center my-5">
                  Complete habits to populate your leaderboard.
                </div>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CCard>
        <CCardHeader className="fw-semibold">Today's habits</CCardHeader>
        <CCardBody>
          <CListGroup className="mb-2">
            {habits.length === 0 && <CListGroupItem>No habits yet</CListGroupItem>}
            {habits.map((habit) => {
              const stats = habitStatsMap[habit.id] || {}
              const recent = stats.recent || {
                completionRate: 0,
                done: 0,
                missed: 0,
              }
              const counts = todayCounts[habit.id] || { done: 0, missed: 0 }
              const todayTotal = counts.done + counts.missed
              const todayCompletionRate = todayTotal
                ? Math.round((counts.done / todayTotal) * 100)
                : 0
              const lifetimeTotal = (stats.totals?.done ?? 0) + (stats.totals?.missed ?? 0)
              const donePercent = lifetimeTotal
                ? Math.round(((stats.totals?.done ?? 0) / lifetimeTotal) * 100)
                : 0
              const missedPercent = lifetimeTotal
                ? Math.round(((stats.totals?.missed ?? 0) / lifetimeTotal) * 100)
                : 0

              return (
                <CListGroupItem key={habit.id} className="py-3">
                  <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                    <div>
                      <div className="fw-semibold">{habit.title || habit.name}</div>
                      <div className="text-body-secondary small">
                        Current streak: {stats.streak?.current ?? 0} days · Last 7-day success:{" "}
                        {formatPercent(recent.completionRate ?? 0)}
                      </div>
                      <div className="text-body-secondary small">
                        Lifetime: {stats.totals?.done ?? 0} done / {stats.totals?.missed ?? 0} missed
                      </div>
                      <div className="text-body-secondary small">
                        Today: {counts.done} done · {counts.missed} missed
                        {todayTotal > 0 ? ` · ${todayCompletionRate}% completion` : ""}
                      </div>
                    </div>
                    <div className="text-end">
                      <CBadge color={statusBadgeColor(stats.successRate ?? 0)} className="mb-2">
                        {formatPercent(stats.successRate ?? 0)} success
                      </CBadge>
                      <div className="text-body-secondary small">
                        {todayTotal > 0 ? `${formatPercent(todayCompletionRate)} today` : "Log today to see completion"}
                      </div>
                    </div>
                  </div>

                  <CProgress className="mt-3" height={12}>
                    <CProgressBar
                      color="success"
                      value={donePercent}
                      title={`Done: ${stats.totals?.done ?? 0}`}
                    />
                    <CProgressBar
                      color="danger"
                      value={missedPercent}
                      title={`Missed: ${stats.totals?.missed ?? 0}`}
                    />
                  </CProgress>
                  <div className="d-flex justify-content-between text-body-secondary small mt-1">
                    <span>{stats.totals?.done ?? 0} completed</span>
                    <span>{stats.totals?.missed ?? 0} missed</span>
                  </div>

                  <div className="border-top pt-3 mt-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
                      <div className="fw-semibold">Today's check-ins</div>
                      <div className="text-body-secondary small">Quickly adjust today's counts.</div>
                    </div>
                    <div className="d-flex flex-column flex-md-row gap-3">
                      <CountAdjuster
                        label="Completed"
                        value={counts.done}
                        color="success"
                        disabled={saving}
                        onIncrement={() => changeCountByDelta(habit.id, "done", 1)}
                        onDecrement={() => changeCountByDelta(habit.id, "done", -1)}
                      />
                      <CountAdjuster
                        label="Missed"
                        value={counts.missed}
                        color="danger"
                        disabled={saving}
                        onIncrement={() => changeCountByDelta(habit.id, "missed", 1)}
                        onDecrement={() => changeCountByDelta(habit.id, "missed", -1)}
                      />
                    </div>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <div className="text-body-secondary small">
                      Last action: {progress[habit.id] ? progress[habit.id] : "Pending"}
                    </div>
                    <div className="d-flex gap-2">
                      <CButton
                        color="danger"
                        size="sm"
                        disabled={saving}
                        onClick={() => markStatus(habit.id, "missed")}
                      >
                        Mark missed
                      </CButton>
                      <CButton
                        color="success"
                        size="sm"
                        disabled={saving}
                        onClick={() => markStatus(habit.id, "done")}
                      >
                        Mark done
                      </CButton>
                    </div>
                  </div>
                </CListGroupItem>
              )
            })}
          </CListGroup>
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ProgressInsights
