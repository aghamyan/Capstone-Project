// /models/index.js
import User from "./User.js";
import Habit from "./Habit.js";
import Schedule from "./Schedule.js";
import Progress from "./Progress.js";
import Notification from "./Notification.js";
import Achievement from "./Achievement.js";
import UserAchievement from "./UserAchievement.js";
import Friend from "./Friend.js";
import GroupChallenge from "./GroupChallenge.js";
import UserGroupChallenge from "./UserGroupChallenge.js";

Schedule.belongsTo(Habit, { foreignKey: "habit_id", as: "habit" });
Habit.hasMany(Schedule, { foreignKey: "habit_id" });


export {
  User,
  Habit,
  Schedule,
  Progress,
  Notification,
  Achievement,
  UserAchievement,
  Friend,
  GroupChallenge,
  UserGroupChallenge,
};