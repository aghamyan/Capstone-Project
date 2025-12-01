import { DataTypes } from "sequelize";
import sequelize from "../sequelize.js";

const GroupChallengeMessage = sequelize.define(
  "GroupChallengeMessage",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    challenge_id: { type: DataTypes.INTEGER, allowNull: false },
    sender_id: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "group_challenge_messages",
    timestamps: false,
  }
);

export default GroupChallengeMessage;
