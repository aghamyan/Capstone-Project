// routes/scheduleRoutes.js
import express from "express";
import Schedule from "../models/Schedule.js";
import Habit from "../models/Habit.js";
import BusySchedule from "../models/BusySchedule.js";

const router = express.Router();

// GET schedules for a user (joins Habit by habit_id) + busy events
router.get("/user/:userId", async (req, res) => {
  try {
    const [habitSchedules, busySchedules] = await Promise.all([
      Schedule.findAll({
        where: { user_id: req.params.userId },
        include: [
          {
            model: Habit,
            as: "habit",
            attributes: ["id", "title"],
            required: false,
          },
        ],
        order: [["day", "ASC"], ["starttime", "ASC"]],
      }),
      BusySchedule.findAll({
        where: { user_id: req.params.userId },
        order: [["day", "ASC"], ["starttime", "ASC"]],
      }),
    ]);

    const mappedSchedules = habitSchedules.map((s) => ({
      ...s.toJSON(),
      type: "habit",
      custom_title: null,
    }));

    const mappedBusy = busySchedules.map((b) => ({
      ...b.toJSON(),
      type: "custom",
      habit: null,
      habit_id: null,
      custom_title: b.title,
    }));

    const combined = [...mappedSchedules, ...mappedBusy].sort((a, b) => {
      const dayA = new Date(a.day).getTime();
      const dayB = new Date(b.day).getTime();
      if (dayA !== dayB) return dayA - dayB;
      return (a.starttime || "").localeCompare(b.starttime || "");
    });

    res.json(combined);
  } catch (err) {
    console.error("Error fetching schedules:", err);
    res.status(500).json({ error: "Failed to fetch schedules", err });
  }
});

// POST create schedule (habit_id optional = custom event)
router.post("/", async (req, res) => {
  try {
    const {
      habit_id,
      user_id,
      day,
      starttime,
      endtime,
      enddate,
      repeat,
      customdays,
      notes,
      type,
      custom_title,
    } = req.body;

    if (!user_id || !day || !starttime) {
      return res.status(400).json({ error: "user_id, day and starttime are required" });
    }

    const trimmedTitle = (custom_title || "").trim();
    const scheduleType = type === "custom" || type === "busy" ? "custom" : "habit";

    if (scheduleType === "habit" && !habit_id) {
      return res.status(400).json({ error: "habit_id is required for habit schedules" });
    }

    if (scheduleType === "custom" && !trimmedTitle) {
      return res.status(400).json({ error: "Title is required for a busy event" });
    }

    if (scheduleType === "habit") {
      const created = await Schedule.create({
        habit_id: Number(habit_id),
        user_id,
        day,
        starttime,
        endtime: endtime || null,
        enddate: enddate || null,
        repeat: repeat || "daily",
        customdays: repeat === "custom" ? customdays || null : null,
        notes: notes || null,
      });

      const scheduleWithHabit = await Schedule.findByPk(created.id, {
        include: [
          {
            model: Habit,
            as: "habit",
            attributes: ["id", "title"],
          },
        ],
      });

      const responsePayload = scheduleWithHabit
        ? { ...scheduleWithHabit.toJSON(), type: "habit", custom_title: null }
        : { ...created.toJSON(), type: "habit", custom_title: null };

      return res.status(201).json(responsePayload);
    }

    const busy = await BusySchedule.create({
      user_id,
      title: trimmedTitle,
      day,
      starttime,
      endtime: endtime || null,
      enddate: enddate || null,
      repeat: repeat || "daily",
      customdays: repeat === "custom" ? customdays || null : null,
      notes: notes || null,
    });

    return res
      .status(201)
      .json({ ...busy.toJSON(), type: "custom", custom_title: trimmedTitle, habit: null });
  } catch (err) {
    console.error("❌ Error creating schedule:", err);
    res.status(500).json({ error: "Failed to add schedule", "err": err });
  }
});

// DELETE schedule
router.delete("/:id", async (req, res) => {
  try {
    const { type } = req.query;

    if (type === "custom") {
      const deletedBusy = await BusySchedule.destroy({ where: { id: req.params.id } });
      if (deletedBusy) return res.json({ message: "Deleted" });
    }

    const deletedSchedule = await Schedule.destroy({ where: { id: req.params.id } });
    if (deletedSchedule) return res.json({ message: "Deleted" });

    const deletedBusy = await BusySchedule.destroy({ where: { id: req.params.id } });
    if (deletedBusy) return res.json({ message: "Deleted" });

    return res.status(404).json({ error: "Schedule not found" });
  } catch (err) {
    console.error("❌ Error deleting schedule:", err);
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});

export default router;