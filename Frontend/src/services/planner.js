import api from "./api"
import { apiGet, apiPost } from "./api"

export const fetchAiSuggestions = async (userId, mode = "balanced") => {
  const res = await api.post("/ai/scheduler", { userId, mode })
  return res.data
}

export const fetchTimeInsights = async (userId) => {
  return apiGet(`/time-insights/summary?userId=${userId}`)
}

export const fetchFocusSessions = async (userId) => {
  return apiGet(`/focus/sessions?userId=${userId}`)
}

export const saveFocusSession = async (payload) => {
  return apiPost("/focus/sessions", payload)
}

export const generateWeeklyReview = async (userId) => {
  return apiPost("/review/generate", { userId })
}

export const saveWeeklyReview = async (payload) => {
  return apiPost("/review/save", payload)
}

export const fetchWeeklyReviews = async (userId) => {
  return apiGet(`/review/get?userId=${userId}`)
}
