import React, { useCallback, useEffect, useMemo, useState } from "react"
import {
  CAlert,
  CBadge,
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CFormCheck,
  CFormInput,
  CFormLabel,
  CFormTextarea,
  CListGroup,
  CListGroupItem,
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CNav,
  CNavItem,
  CNavLink,
  COffcanvas,
  COffcanvasBody,
  COffcanvasHeader,
  COffcanvasTitle,
  CRow,
  CSpinner,
  CTabContent,
  CTabPane,
  CProgress,
  CProgressBar,
  CFormSwitch,
} from "@coreui/react"
import CIcon from "@coreui/icons-react"
import {
  cilBolt,
  cilChatBubble,
  cilClock,
  cilChartLine,
  cilBadge,
  cilList,
  cilPencil,
  cilPlus,
  cilTrash,
} from "@coreui/icons"

import AddHabit from "./AddHabit"
import HabitLibrary from "./HabitLibrary"
import ProgressTracker from "./ProgressTracker"
import HabitCoach from "./HabitCoach"
import { getHabits, deleteHabit, updateHabit } from "../../services/habits"
import { logHabitProgress } from "../../services/progress"
import { promptMissedReflection } from "../../utils/reflection"
import { getDailyChallengeSummary } from "../../services/dailyChallenge"

const createEditDraft = (habit) => ({
  id: habit?.id,
  title: habit?.title || "",
  description: habit?.description || "",
  category: habit?.category || "",
  target_reps: habit?.target_reps ?? "",
  is_daily_goal: Boolean(habit?.is_daily_goal),
})

const DailyChallengeHighlight = ({ challenge, onLog }) => {
  if (!challenge?.focusHabit) return null
  const focus = challenge.focusHabit
  const progressPercent = focus.targetForToday
    ? Math.min(100, Math.round((focus.doneToday / focus.targetForToday) * 100))
    : 0

  return (
    <CCard className="h-100 shadow-sm border-0 habits-panel challenge-card">
      <CCardHeader className="bg-gradient-primary text-white">
        <div className="d-flex align-items-center gap-3">
          <CIcon icon={cilBolt} size="lg" />
          <div>
            <div className="text-uppercase small fw-semibold opacity-75">
              Daily Challenge
            </div>
            <h5 className="mb-0">Focus: {focus.title || focus.name}</h5>
          </div>
        </div>
      </CCardHeader>
      <CCardBody className="d-flex flex-column gap-3">
        <div className="d-flex align-items-center justify-content-between">
          <div className="text-body-secondary small">Reason</div>
          {focus.category && (
            <CBadge color="warning" className="text-dark">
              {focus.category}
            </CBadge>
          )}
        </div>
        <p className="mb-0 text-body-secondary">{focus.reason}</p>
        <div className="bg-body-secondary rounded p-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <span className="text-uppercase small text-muted">Today's progress</span>
            <span className="fw-semibold">{progressPercent}%</span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            <CBadge color="success">{focus.doneToday}</CBadge>
            <span className="text-muted small">of {focus.targetForToday} wins</span>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <CButton color="success" size="sm" onClick={() => onLog(focus, "done")}>Log done</CButton>
          <CButton color="danger" size="sm" variant="outline" onClick={() => onLog(focus, "missed")}>
            Log missed
          </CButton>
        </div>
      </CCardBody>
    </CCard>
  )
}

const MyHabitsTab = ({ onAddClick }) => {
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState(null)
  const [challenge, setChallenge] = useState(null)
  const [challengeError, setChallengeError] = useState("")
  const [loggingState, setLoggingState] = useState(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editDraft, setEditDraft] = useState(createEditDraft({}))
  const [savingEdit, setSavingEdit] = useState(false)

  const user = JSON.parse(localStorage.getItem("user") || "{}")
  const userId = user?.id

  const loadHabits = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      setHabits([])
      return
    }
    try {
      setLoading(true)
      const data = await getHabits(userId)
      setHabits(Array.isArray(data) ? data : [])
      setFeedback(null)
    } catch (error) {
      console.error("Failed to load habits", error)
      setFeedback({ type: "danger", message: "Unable to load your habits." })
    } finally {
      setLoading(false)
    }
  }, [userId])

  const loadChallenge = useCallback(async () => {
    if (!userId) return
    try {
      const data = await getDailyChallengeSummary(userId)
      setChallenge(data)
      setChallengeError("")
    } catch (error) {
      console.error("Failed to load challenge", error)
      setChallenge(null)
      setChallengeError("Daily Challenge is temporarily unavailable.")
    }
  }, [userId])

  useEffect(() => {
    loadHabits()
    loadChallenge()
  }, [loadChallenge, loadHabits])

  useEffect(() => {
    if (!feedback) return undefined
    const t = setTimeout(() => setFeedback(null), 4000)
    return () => clearTimeout(t)
  }, [feedback])

  const handleLog = async (habit, status) => {
    const habitId = habit?.id || habit?.habitId
    if (!habitId || !userId) return
    const payload = { userId, status }
    if (status === "missed") {
      const reason = promptMissedReflection(habit.title || habit.name || habit.habitName)
      if (!reason) return
      payload.reason = reason
    }

    try {
      setLoggingState(`${habitId}-${status}`)
      await logHabitProgress(habitId, payload)
      setFeedback({
        type: "success",
        message: `Logged ${status} for ${habit.title || habit.name || habit.habitName}.`,
      })
    } catch (error) {
      console.error("Failed to log status", error)
      setFeedback({ type: "danger", message: "Could not record that action." })
    } finally {
      setLoggingState(null)
    }
  }

  const handleDelete = async (habitId) => {
    try {
      await deleteHabit(habitId)
      setHabits((prev) => prev.filter((h) => h.id !== habitId))
      setFeedback({ type: "success", message: "Habit deleted." })
    } catch (error) {
      console.error("Failed to delete", error)
      setFeedback({ type: "danger", message: "Unable to delete habit right now." })
    }
  }

  const startEdit = (habit) => {
    setEditDraft(createEditDraft(habit))
    setShowEditor(true)
  }

  const saveEdit = async () => {
    if (!editDraft.title || !editDraft.title.trim()) {
      setFeedback({ type: "danger", message: "Title is required." })
      return
    }
    try {
      setSavingEdit(true)
      const payload = {
        ...editDraft,
        title: editDraft.title.trim(),
        description: editDraft.description?.trim() || null,
        category: editDraft.category?.trim() || null,
        target_reps:
          editDraft.target_reps === "" || editDraft.target_reps === null
            ? null
            : Number(editDraft.target_reps),
      }
      const updated = await updateHabit(editDraft.id, payload)
      setHabits((prev) =>
        prev.map((habit) => (habit.id === updated.id ? { ...habit, ...updated } : habit)),
      )
      setShowEditor(false)
      setFeedback({ type: "success", message: "Habit updated." })
    } catch (error) {
      console.error("Failed to update habit", error)
      setFeedback({ type: "danger", message: "Could not save your changes." })
    } finally {
      setSavingEdit(false)
    }
  }

  const emptyState = useMemo(
    () => (
      <div className="text-center text-body-secondary py-5">
        <div className="display-6 mb-2">✨</div>
        <p className="mb-3">No habits yet. Create your first one to get started.</p>
        <CButton color="primary" onClick={onAddClick}>
          <CIcon icon={cilPlus} className="me-2" /> Add habit
        </CButton>
      </div>
    ),
    [onAddClick],
  )

  return (
    <div className="mt-3 habits-section">
      <CRow className="g-4">
        <CCol lg={4}>
          {challengeError && <CAlert color="warning">{challengeError}</CAlert>}
          <DailyChallengeHighlight challenge={challenge} onLog={handleLog} />
        </CCol>
        <CCol lg={8}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="d-flex align-items-center justify-content-between bg-white border-0">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilList} className="text-primary" />
                <span className="fw-semibold">My habits</span>
              </div>
              <div className="d-flex gap-2">
                <CButton color="primary" size="sm" variant="outline" className="rounded-pill" onClick={onAddClick}>
                  <CIcon icon={cilPlus} className="me-1" /> Add habit
                </CButton>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              {feedback && <CAlert color={feedback.type}>{feedback.message}</CAlert>}
              {loading ? (
                <div className="d-flex justify-content-center py-4">
                  <CSpinner color="primary" />
                </div>
              ) : habits.length === 0 ? (
                emptyState
              ) : (
                <CListGroup flush className="habits-list">
                  {habits.map((habit) => (
                    <CListGroupItem key={habit.id} className="py-3 habit-item">
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div className="d-flex flex-column gap-1">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <span className="fw-semibold habit-title">{habit.title}</span>
                            {habit.category && (
                              <CBadge color="info" className="text-uppercase small subtle-badge">
                                {habit.category}
                              </CBadge>
                            )}
                            {habit.is_daily_goal && <CBadge color="success">Daily</CBadge>}
                          </div>
                          <div className="text-body-secondary small">
                            {habit.description || "No description"}
                          </div>
                          {habit.target_reps ? (
                            <div className="text-body-secondary small mt-1">
                              🎯 Target: {habit.target_reps}
                            </div>
                          ) : null}
                        </div>
                        <div className="d-flex flex-wrap gap-2 habit-actions">
                          <CButton
                            size="sm"
                            color="success"
                            className="rounded-pill"
                            disabled={loggingState === `${habit.id}-done`}
                            onClick={() => handleLog(habit, "done")}
                          >
                            {loggingState === `${habit.id}-done` ? "Logging..." : "Log done"}
                          </CButton>
                          <CButton
                            size="sm"
                            color="warning"
                            variant="outline"
                            className="rounded-pill"
                            disabled={loggingState === `${habit.id}-missed`}
                            onClick={() => handleLog(habit, "missed")}
                          >
                            {loggingState === `${habit.id}-missed` ? "Logging..." : "Log missed"}
                          </CButton>
                          <CButton
                            size="sm"
                            color="secondary"
                            variant="outline"
                            className="rounded-pill"
                            onClick={() => startEdit(habit)}
                          >
                            <CIcon icon={cilPencil} className="me-1" /> Edit
                          </CButton>
                          <CButton
                            size="sm"
                            color="danger"
                            variant="ghost"
                            className="rounded-pill"
                            onClick={() => handleDelete(habit.id)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                      </div>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CModal visible={showEditor} onClose={() => setShowEditor(false)} alignment="center">
        <CModalHeader closeButton>
          <CModalTitle>Edit habit</CModalTitle>
        </CModalHeader>
        <CModalBody className="d-flex flex-column gap-3">
          <div>
            <CFormLabel>Title</CFormLabel>
            <CFormInput
              value={editDraft.title}
              onChange={(e) => setEditDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Habit title"
            />
          </div>
          <div>
            <CFormLabel>Description</CFormLabel>
            <CFormTextarea
              rows={3}
              value={editDraft.description}
              onChange={(e) => setEditDraft((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <CFormLabel>Category</CFormLabel>
              <CFormInput
                value={editDraft.category}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="Wellness, Focus, Growth..."
              />
            </div>
            <div className="col-md-6">
              <CFormLabel>Target repetitions</CFormLabel>
              <CFormInput
                type="number"
                min={0}
                value={editDraft.target_reps}
                onChange={(e) => setEditDraft((prev) => ({ ...prev, target_reps: e.target.value }))}
              />
            </div>
          </div>
          <CFormCheck
            id="edit-daily-goal"
            label="Count this as a daily goal"
            checked={editDraft.is_daily_goal}
            onChange={(e) => setEditDraft((prev) => ({ ...prev, is_daily_goal: e.target.checked }))}
          />
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" variant="ghost" onClick={() => setShowEditor(false)}>
            Cancel
          </CButton>
          <CButton color="primary" disabled={savingEdit} onClick={saveEdit}>
            {savingEdit ? "Saving..." : "Save changes"}
          </CButton>
        </CModalFooter>
      </CModal>
    </div>
  )
}

const InsightsTab = () => {
  const insightData = useMemo(
    () => ({
      topHabits: [
        { name: "Morning run", rate: 92, streak: 12 },
        { name: "Hydration", rate: 88, streak: 9 },
        { name: "Reading", rate: 84, streak: 7 },
      ],
      strugglingHabits: [
        { name: "Sleep by 11pm", rate: 56 },
        { name: "Inbox zero", rate: 61 },
        { name: "Deep work", rate: 64 },
      ],
      winRatesByCategory: [
        { name: "Health", value: 82 },
        { name: "Focus", value: 74 },
        { name: "Learning", value: 68 },
        { name: "Wellness", value: 71 },
      ],
      forecast: [
        { label: "Mon", chance: 92 },
        { label: "Tue", chance: 89 },
        { label: "Wed", chance: 85 },
        { label: "Thu", chance: 87 },
        { label: "Fri", chance: 81 },
        { label: "Sat", chance: 78 },
        { label: "Sun", chance: 76 },
      ],
      bestTime: {
        window: "7:00 - 9:00 AM",
        detail: "Highest completion before meetings begin.",
        lift: "+14% vs average",
      },
    }),
    [],
  )

  return (
    <div className="mt-3">
      <CRow className="g-4">
        <CCol lg={6}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilChartLine} />
                <span className="fw-semibold">Highest performing habits</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <CFormLabel className="text-uppercase small text-muted mb-1">Consistency rate</CFormLabel>
              <div className="d-flex flex-column gap-2">
                {insightData.topHabits.map((habit) => (
                  <div key={habit.name} className="d-flex align-items-center gap-3">
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="fw-semibold">{habit.name}</span>
                        <CBadge color="success">{habit.rate}%</CBadge>
                      </div>
                      <CProgress className="mt-2" thin color="success" value={habit.rate} />
                    </div>
                    <CBadge color="light" className="text-dark">
                      {habit.streak} day streak
                    </CBadge>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={6}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilList} className="text-warning" />
                <span className="fw-semibold">Most struggling habits</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <CFormLabel className="text-uppercase small text-muted mb-1">Win rate</CFormLabel>
              {insightData.strugglingHabits.map((habit) => (
                <div key={habit.name} className="bg-body-tertiary rounded-3 p-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold">{habit.name}</span>
                    <CBadge color="warning" className="text-dark">{habit.rate}%</CBadge>
                  </div>
                  <CProgress color="warning" value={habit.rate} />
                  <small className="text-muted">Add a lighter variant or pair with a reminder.</small>
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="g-4 mt-1">
        <CCol lg={5}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilClock} className="text-primary" />
                <span className="fw-semibold">Best completion time</span>
              </div>
            </CCardHeader>
            <CCardBody>
              <div className="p-3 rounded-4" style={{ background: "linear-gradient(120deg, #e0ecff, #f3f8ff)" }}>
                <div className="text-uppercase small text-muted">Time of day</div>
                <h4 className="fw-bold mb-1">{insightData.bestTime.window}</h4>
                <p className="text-body-secondary mb-2">{insightData.bestTime.detail}</p>
                <CBadge color="info" className="text-dark">{insightData.bestTime.lift}</CBadge>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={4}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilBadge} className="text-success" />
                <span className="fw-semibold">Win rate by category</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              {insightData.winRatesByCategory.map((category) => (
                <div key={category.name}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span>{category.name}</span>
                    <CBadge color="light" className="text-dark">
                      {category.value}%
                    </CBadge>
                  </div>
                  <CProgress color="primary" value={category.value} />
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={3}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilBolt} className="text-info" />
                <span className="fw-semibold">Weekly success forecast</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              {insightData.forecast.map((day) => (
                <div key={day.label}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted">{day.label}</span>
                    <span className="fw-semibold">{day.chance}%</span>
                  </div>
                  <CProgressBar color="info" value={day.chance} className="rounded-pill" />
                </div>
              ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

const HistoryTab = () => {
  const heatmap = useMemo(() => Array.from({ length: 30 }, (_, i) => (i % 7 === 0 ? "missed" : "done")), [])
  const streak = { longest: 21, current: 8, goal: 30 }

  const exportCsv = () => {
    const header = "day,status\n"
    const rows = heatmap
      .map((value, index) => `Day ${index + 1},${value}`)
      .join("\n")
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "habit-history.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mt-3">
      <CRow className="g-4">
        <CCol lg={7}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilChartLine} className="text-primary" />
                <span className="fw-semibold">Habit history</span>
              </div>
              <CButton color="primary" size="sm" variant="outline" onClick={exportCsv}>
                Export CSV
              </CButton>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="fw-semibold">Calendar heatmap</span>
                  <CBadge color="light" className="text-dark">Last 30 days</CBadge>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {heatmap.map((value, index) => (
                    <div
                      key={index}
                      className="rounded-2"
                      style={{
                        width: "26px",
                        height: "26px",
                        background:
                          value === "done"
                            ? "linear-gradient(135deg, #74d680, #3bb78f)"
                            : "linear-gradient(135deg, #ffd166, #ff6b6b)",
                        opacity: value === "done" ? 0.95 : 0.8,
                      }}
                      title={`${value === "done" ? "Completed" : "Missed"} on day ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-3 bg-body-tertiary">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Monthly view</span>
                  <CBadge color="info" className="text-dark">June snapshot</CBadge>
                </div>
                <div className="d-flex flex-wrap gap-3">
                  <div>
                    <div className="text-muted small">Completion</div>
                    <h4 className="fw-bold mb-0">82%</h4>
                  </div>
                  <div>
                    <div className="text-muted small">Missed</div>
                    <h4 className="fw-bold mb-0">6 days</h4>
                  </div>
                  <div>
                    <div className="text-muted small">Perfect days</div>
                    <h4 className="fw-bold mb-0">12</h4>
                  </div>
                </div>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={5}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilBolt} className="text-success" />
                <span className="fw-semibold">Longest streak</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <div className="p-3 rounded-4" style={{ background: "linear-gradient(135deg, #e1f3e3, #f2fff6)" }}>
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <span className="text-muted">Personal best</span>
                  <CBadge color="success">{streak.longest} days</CBadge>
                </div>
                <CProgress value={(streak.longest / streak.goal) * 100} color="success" className="mb-2" />
                <small className="text-body-secondary">Goal: {streak.goal}-day streak</small>
              </div>
              <div className="bg-body-tertiary p-3 rounded-3">
                <div className="d-flex justify-content-between">
                  <span>Current streak</span>
                  <span className="fw-semibold">{streak.current} days</span>
                </div>
                <CProgress color="info" value={(streak.current / streak.goal) * 100} className="mt-2" />
                <small className="text-muted">Keep the run alive this week.</small>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

const AutomationTab = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      title: "If habit missed 2 days → prompt reflection",
      description: "Trigger a short note so you can capture what got in the way.",
      active: true,
      tone: "info",
    },
    {
      id: 2,
      title: "If streak reaches 5 → award badge",
      description: "Celebrate momentum with a subtle badge and XP boost.",
      active: true,
      tone: "success",
    },
    {
      id: 3,
      title: "Notify if scheduled habit window passes without completion",
      description: "Send a quiet nudge to reschedule or log a reason.",
      active: false,
      tone: "warning",
    },
  ])

  const toggleRule = (ruleId) => {
    setRules((prev) => prev.map((rule) => (rule.id === ruleId ? { ...rule, active: !rule.active } : rule)))
  }

  return (
    <div className="mt-3">
      <CRow className="g-4">
        {rules.map((rule) => (
          <CCol key={rule.id} lg={4}>
            <CCard className="shadow-sm border-0 h-100 habits-panel">
              <CCardHeader className="bg-white d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <CIcon icon={cilBolt} className={`text-${rule.tone}`} />
                  <span className="fw-semibold">Automation</span>
                </div>
                <CFormSwitch checked={rule.active} onChange={() => toggleRule(rule.id)} />
              </CCardHeader>
              <CCardBody className="d-flex flex-column gap-2">
                <h6 className="mb-1">{rule.title}</h6>
                <p className="text-body-secondary mb-0">{rule.description}</p>
                <div className="d-flex align-items-center gap-2 mt-auto">
                  <CBadge color={rule.tone}>{rule.active ? "Enabled" : "Disabled"}</CBadge>
                  <small className="text-muted">Automation keeps habits on autopilot.</small>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        ))}
      </CRow>
    </div>
  )
}

const RewardsTab = () => {
  const rewards = {
    xp: 1280,
    level: 6,
    nextLevel: 7,
    progressToNext: 65,
    badges: [
      { name: "Momentum", note: "5-day streak", color: "success" },
      { name: "Consistency", note: "20 completions", color: "info" },
      { name: "Night owl reset", note: "3 evening wins", color: "warning" },
    ],
  }

  return (
    <div className="mt-3">
      <CRow className="g-4">
        <CCol lg={5}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-gradient-primary text-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilBadge} />
                <span className="fw-semibold">Rewards</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-uppercase small text-muted">Current level</div>
                  <h3 className="fw-bold mb-0">Level {rewards.level}</h3>
                  <small className="text-body-secondary">Next: Level {rewards.nextLevel}</small>
                </div>
                <CBadge color="light" className="text-dark">
                  {rewards.xp} XP
                </CBadge>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-muted">Progress to next level</span>
                  <span className="fw-semibold">{rewards.progressToNext}%</span>
                </div>
                <CProgress value={rewards.progressToNext} color="success" />
              </div>
              <div className="p-3 rounded-3 bg-body-tertiary">
                <div className="text-muted small mb-1">How XP works</div>
                <p className="mb-0 text-body-secondary">
                  Earn XP for completions, streak milestones, and automations that keep you consistent.
                </p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol lg={7}>
          <CCard className="shadow-sm border-0 h-100 habits-panel">
            <CCardHeader className="bg-white">
              <div className="d-flex align-items-center gap-2">
                <CIcon icon={cilChartLine} className="text-success" />
                <span className="fw-semibold">Badges & levels</span>
              </div>
            </CCardHeader>
            <CCardBody className="d-flex flex-column gap-3">
              <div className="d-flex flex-wrap gap-2">
                {rewards.badges.map((badge) => (
                  <CBadge key={badge.name} color={badge.color} className="px-3 py-2">
                    <span className="fw-semibold">{badge.name}</span>
                    <div className="small text-white-50">{badge.note}</div>
                  </CBadge>
                ))}
              </div>
              <div className="bg-body-tertiary p-3 rounded-3">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-semibold">Minimal gamification</span>
                  <CBadge color="primary" className="text-uppercase small">Focused</CBadge>
                </div>
                <p className="mb-0 text-body-secondary">
                  Stay motivated without distraction—rewards stay subtle and purposeful so the habit stays center stage.
                </p>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

const HabitCoachBubble = () => {
  const [visible, setVisible] = useState(false)

  return (
    <>
      <CButton
        color="info"
        size="lg"
        className="position-fixed shadow habit-coach-bubble"
        style={{ bottom: "24px", right: "24px", zIndex: 1050 }}
        onClick={() => setVisible(true)}
      >
        <CIcon icon={cilChatBubble} className="me-2" /> Habit Coach
      </CButton>
      <COffcanvas placement="end" visible={visible} onHide={() => setVisible(false)} backdrop>
        <COffcanvasHeader closeButton>
          <COffcanvasTitle>
            <div className="d-flex align-items-center gap-2">
              <CIcon icon={cilChatBubble} />
              <span>Habit Coach</span>
            </div>
          </COffcanvasTitle>
        </COffcanvasHeader>
        <COffcanvasBody className="p-0" style={{ height: "100vh" }}>
          <div className="h-100 overflow-auto">
            <HabitCoach />
          </div>
        </COffcanvasBody>
      </COffcanvas>
    </>
  )
}

const Habits = () => {
  const [activeTab, setActiveTab] = useState("my-habits")

  const heroStats = useMemo(
    () => [
      { label: "Weekly win rate", value: "82%", tone: "success" },
      { label: "Current streak", value: "21 days", tone: "info" },
      { label: "Active habits", value: "12", tone: "warning" },
    ],
    [],
  )

  return (
    <div className="pt-3 pb-5 position-relative habits-page">
      <div className="habits-hero mb-4">
        <div className="d-flex flex-column gap-2">
          <div className="d-flex align-items-center gap-2">
            <CBadge color="info" className="text-uppercase fw-semibold mini-badge">Modernized</CBadge>
            <span className="text-body-secondary small">Smart routines, powerful insights</span>
          </div>
          <h2 className="fw-bold mb-1">Habits</h2>
          <p className="text-body-secondary mb-0">
            One home for creating, browsing, tracking, and celebrating your habits. Everything feels calm, clear,
            and ready for momentum.
          </p>
          <div className="d-flex gap-2 flex-wrap mt-1">
            <CButton color="primary" size="sm" className="rounded-pill" onClick={() => setActiveTab("add")}>
              <CIcon icon={cilPlus} className="me-2" /> Add new habit
            </CButton>
            <CButton color="light" size="sm" className="rounded-pill">
              View quick wins
            </CButton>
          </div>
        </div>
        <div className="d-flex flex-wrap gap-3 habits-hero-stats">
          {heroStats.map((stat) => (
            <div key={stat.label} className="habits-hero-card">
              <span className="text-uppercase small text-muted">{stat.label}</span>
              <h4 className="fw-bold mb-0">{stat.value}</h4>
              <div className={`badge bg-${stat.tone} bg-opacity-10 text-${stat.tone} fw-semibold mt-2`}>
                Trending
              </div>
            </div>
          ))}
        </div>
      </div>

      <CNav variant="tabs" role="tablist" className="mb-3 habits-nav">
        <CNavItem>
          <CNavLink active={activeTab === "my-habits"} onClick={() => setActiveTab("my-habits")}>My Habits</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "add"} onClick={() => setActiveTab("add")}>Add Habit</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "library"} onClick={() => setActiveTab("library")}>
            Habit Library
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "progress"} onClick={() => setActiveTab("progress")}>
            Progress
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "insights"} onClick={() => setActiveTab("insights")}>
            Insights
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "history"} onClick={() => setActiveTab("history")}>
            History
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "automation"} onClick={() => setActiveTab("automation")}>
            Automation
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink active={activeTab === "rewards"} onClick={() => setActiveTab("rewards")}>
            Rewards
          </CNavLink>
        </CNavItem>
      </CNav>

      <CTabContent>
        <CTabPane visible={activeTab === "my-habits"}>
          <MyHabitsTab onAddClick={() => setActiveTab("add")} />
        </CTabPane>
        <CTabPane visible={activeTab === "add"}>
          <div className="mt-3">
            <AddHabit />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === "library"}>
          <div className="mt-3">
            <HabitLibrary />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === "progress"}>
          <div className="mt-3">
            <ProgressTracker />
          </div>
        </CTabPane>
        <CTabPane visible={activeTab === "insights"}>
          <InsightsTab />
        </CTabPane>
        <CTabPane visible={activeTab === "history"}>
          <HistoryTab />
        </CTabPane>
        <CTabPane visible={activeTab === "automation"}>
          <AutomationTab />
        </CTabPane>
        <CTabPane visible={activeTab === "rewards"}>
          <RewardsTab />
        </CTabPane>
      </CTabContent>

      <HabitCoachBubble />
    </div>
  )
}

export default Habits
