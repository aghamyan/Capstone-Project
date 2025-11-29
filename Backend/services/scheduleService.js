import Schedule from "../models/Schedule.js";
import Habit from "../models/Habit.js";
import User from "../models/User.js";

const DEFAULT_DURATION_MINUTES = 60;

const toDate = (value) => (value ? new Date(value) : null);

const combineDayAndTime = (day, time) => {
  if (!day || !time) return null;
  const dayPart = typeof day === "string" ? day : day.toISOString().slice(0, 10);
  return new Date(`${dayPart}T${time}`);
};

const resolveScheduledFor = ({ scheduled_for, day, starttime }) => {
  const explicit = toDate(scheduled_for);
  if (explicit && !Number.isNaN(explicit.getTime())) return explicit;

  const combined = combineDayAndTime(day, starttime);
  if (combined && !Number.isNaN(combined.getTime())) return combined;

  return null;
};

const resolveEndsAt = (scheduledFor, { ends_at, endtime, duration_minutes }) => {
  const explicitEnd = toDate(ends_at) || combineDayAndTime(scheduledFor, endtime);
  if (explicitEnd && !Number.isNaN(explicitEnd.getTime())) return explicitEnd;

  const duration = Number.isFinite(Number(duration_minutes))
    ? Number(duration_minutes)
    : DEFAULT_DURATION_MINUTES;

  return new Date(scheduledFor.getTime() + duration * 60 * 1000);
};

const windowForSchedule = (schedule) => {
  const scheduledFor = toDate(schedule.scheduled_for);
  const endsAt = schedule.ends_at
    ? toDate(schedule.ends_at)
    : new Date(scheduledFor.getTime() + DEFAULT_DURATION_MINUTES * 60 * 1000);
  return { start: scheduledFor, end: endsAt };
};

const windowsOverlap = (a, b) => a.start < b.end && b.start < a.end;

const findConflictingSchedule = async (userid, candidateWindow) => {
  const schedules = await Schedule.findAll({ where: { userid } });
  return schedules.find((existing) => {
    const existingWindow = windowForSchedule(existing);
    return windowsOverlap(existingWindow, candidateWindow);
  });
};

const ensureUserExists = async (userid) => {
  const user = await User.findByPk(userid, { attributes: ["id"] });
  if (!user) {
    const error = new Error("User not found");
    error.status = 404;
    throw error;
  }
};

const resolveHabitId = async ({ habit_id, userid, type, custom_title, notes }) => {
  if (habit_id) return Number(habit_id);
  if (type !== "custom") return null;

  const title = (custom_title || "").trim();
  if (!title) {
    const error = new Error("custom_title is required when creating a custom schedule");
    error.status = 400;
    throw error;
  }

  const [habit] = await Habit.findOrCreate({
    where: { user_id: userid, title },
    defaults: { description: notes || null, category: "custom" },
  });
  return habit.id;
};

export const getUserSchedules = async (userId) => {
  const userid = Number(userId);
  if (Number.isNaN(userid)) {
    const error = new Error("Invalid user id");
    error.status = 400;
    throw error;
  }

  await ensureUserExists(userid);

  return Schedule.findAll({
    where: { userid },
    include: [
      {
        model: Habit,
        as: "habit",
        attributes: ["id", "title"],
        required: false,
      },
    ],
    order: [["scheduled_for", "ASC"]],
  });
};

export const createSchedule = async (payload) => {
  const {
    userid,
    day,
    starttime,
    endtime,
    ends_at,
    scheduled_for,
    duration_minutes,
    repeat,
    customdays,
    notes,
    type,
    custom_title,
    habit_id,
  } = payload;

  if (!userid) {
    const error = new Error("userid is required");
    error.status = 400;
    throw error;
  }

  await ensureUserExists(userid);

  const scheduledFor = resolveScheduledFor({ scheduled_for, day, starttime });
  if (!scheduledFor) {
    const error = new Error("scheduled_for or (day + starttime) is required");
    error.status = 400;
    throw error;
  }

  const endsAt = resolveEndsAt(scheduledFor, { ends_at, endtime, duration_minutes });
  if (scheduledFor >= endsAt) {
    const error = new Error("Schedule end time must be after start time");
    error.status = 400;
    throw error;
  }

  const habitId = await resolveHabitId({
    habit_id,
    userid,
    type,
    custom_title,
    notes,
  });

  if (!habitId) {
    const error = new Error("habit_id is required for habit schedules");
    error.status = 400;
    throw error;
  }

  const candidateWindow = { start: scheduledFor, end: endsAt };
  const conflict = await findConflictingSchedule(userid, candidateWindow);
  if (conflict) {
    const error = new Error("This schedule conflicts with an existing one");
    error.status = 409;
    throw error;
  }

  const created = await Schedule.create({
    habit_id: habitId,
    userid,
    scheduled_for: scheduledFor,
    ends_at: endsAt,
    repeat: repeat || "once",
    customdays: repeat === "custom" ? customdays || null : null,
    notes: notes || null,
  });

  return Schedule.findByPk(created.id, {
    include: [
      {
        model: Habit,
        as: "habit",
        attributes: ["id", "title"],
      },
    ],
  });
};

export const deleteSchedule = async (id) => {
  const deleted = await Schedule.destroy({ where: { id } });
  if (!deleted) {
    const error = new Error("Schedule not found");
    error.status = 404;
    throw error;
  }
  return deleted;
};

export const getRecommendations = async (userid) => {
  await ensureUserExists(userid);
  return {
    userid,
    suggestions: [],
    message: "Schedule recommendations will be powered by AI in a future update.",
  };
};

export default {
  getUserSchedules,
  createSchedule,
  deleteSchedule,
  getRecommendations,
};
