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
      // Stored as a string column to keep Sequelize from trying to change the
      // database type to a non-existent "VIRTUAL" type during sync. We still
      // derive the value from `scheduled_for` when possible, falling back to
      // any persisted value for backwards compatibility.
      type: DataTypes.STRING(10),
      allowNull: true,
      get() {
        const scheduledFor = this.getDataValue("scheduled_for");
        if (!scheduledFor) return this.getDataValue("day");
        return new Date(scheduledFor).toISOString().slice(0, 10);
      },
    },
    starttime: {
      // Same approach as `day` to avoid altering the column to an unsupported
      // type while still exposing the derived value when available.
      type: DataTypes.STRING(5),
      allowNull: true,
      get() {
        const scheduledFor = this.getDataValue("scheduled_for");
        if (!scheduledFor) return this.getDataValue("starttime");
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
    ],
  }
);

export default Schedule;
