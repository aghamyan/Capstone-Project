import {
  createSchedule,
  deleteSchedule,
  getRecommendations,
  getUserSchedules,
} from "../services/scheduleService.js";

export const listUserSchedules = async (req, res, next) => {
  try {
    const schedules = await getUserSchedules(req.params.userId);
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

export const addSchedule = async (req, res, next) => {
  try {
    const created = await createSchedule(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const removeSchedule = async (req, res, next) => {
  try {
    await deleteSchedule(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    next(error);
  }
};

export const recommendSchedules = async (req, res, next) => {
  try {
    const recommendations = await getRecommendations(Number(req.params.userId));
    res.json(recommendations);
  } catch (error) {
    next(error);
  }
};

export default {
  listUserSchedules,
  addSchedule,
  removeSchedule,
  recommendSchedules,
};
