import { DataTypes } from "sequelize"
import sequelize from "../sequelize.js"

const TimeLog = sequelize.define(
  "TimeLog",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    session_date: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    duration_minutes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "completed",
    },
    interruptions: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    mood: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    focus_score: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    output: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "time_logs",
    underscored: true,
  }
)

export default TimeLog
