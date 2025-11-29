import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Schedule = sequelize.define(
  "Schedule",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    habit_id: { type: DataTypes.INTEGER, allowNull: true },
    userid: { type: DataTypes.INTEGER, allowNull: false },
    scheduled_for: { type: DataTypes.DATE, allowNull: false },
    ends_at: { type: DataTypes.DATE, allowNull: true },
    repeat: { type: DataTypes.STRING(50), allowNull: false, defaultValue: "once" },
    customdays: { type: DataTypes.STRING(100), allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    day: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      get() {
        const explicit = this.getDataValue("day");
        if (explicit) return explicit;

        const scheduledFor = this.getDataValue("scheduled_for");
        if (!scheduledFor) return null;
        return new Date(scheduledFor).toISOString().slice(0, 10);
      },
    },
    starttime: {
      type: DataTypes.STRING(5),
      allowNull: true,
      get() {
        const explicit = this.getDataValue("starttime");
        if (explicit) return explicit;

        const scheduledFor = this.getDataValue("scheduled_for");
        if (!scheduledFor) return null;
        return new Date(scheduledFor).toISOString().substring(11, 16);
      },
    },
  },
  {
    tableName: "schedules",
    timestamps: true,
    createdAt: "createdat",
    updatedAt: "updatedat",
    underscored: false,
    indexes: [
      { fields: ["userid"] },
      { fields: ["habit_id"] },
      { fields: ["scheduled_for"] },
      { fields: ["day"] },
      { fields: ["starttime"] },
    ],
    hooks: {
      beforeValidate(schedule) {
        const scheduledFor = schedule.getDataValue("scheduled_for");

        if (scheduledFor) {
          const date = new Date(scheduledFor);
          if (!Number.isNaN(date.getTime())) {
            if (!schedule.getDataValue("day")) {
              schedule.setDataValue("day", date.toISOString().slice(0, 10));
            }
            if (!schedule.getDataValue("starttime")) {
              schedule.setDataValue("starttime", date.toISOString().substring(11, 16));
            }
          }
        } else if (schedule.getDataValue("day") && schedule.getDataValue("starttime")) {
          const combined = new Date(`${schedule.getDataValue("day")}T${schedule.getDataValue("starttime")}`);
          if (!Number.isNaN(combined.getTime())) {
            schedule.setDataValue("scheduled_for", combined);
          }
        }
      },
    },
  }
);

export default Schedule;
