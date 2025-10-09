// src/services/schedules.js
import { apiGet, apiPost, apiPut, apiDelete } from "./api";

export const getSchedules = (userId, habitId) =>
  apiGet(`/api/schedules/user/${userId}${habitId ? `?habit_id=${habitId}` : ""}`);

export const createSchedule = (payload) => apiPost("/api/schedules", payload);

export const updateSchedule = (id, payload) => apiPut(`/api/schedules/${id}`, payload);

export const deleteSchedule = (id) => apiDelete(`/api/schedules/${id}`);