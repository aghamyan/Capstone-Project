import { DataTypes } from "sequelize"
import sequelize from "../sequelize.js"

const WeeklyReview = sequelize.define(
  "WeeklyReview",
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
    week_start: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    summary: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    reflections: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    draft_plan: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    tableName: "weekly_reviews",
    underscored: true,
  }
)

export default WeeklyReview
