import dotenv from "dotenv";
import app from "./app.js";
import sequelize from "./config/db.js";
import "./models/index.js";

dotenv.config();

const PORT = process.env.PORT || 5001;

const start = async () => {
  try {
    // Test the DB connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    // Keep the database schema in sync with the models to avoid missing column errors
    // when the table definitions evolve (e.g., new `avatar` column on users).
    await sequelize.sync({ alter: true, force: false });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("❌ Database connection failed:", err);
    process.exit(1);
  }
};

start();
