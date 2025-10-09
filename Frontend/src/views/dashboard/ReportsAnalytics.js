import React, { useEffect, useState } from "react";
import axios from "axios";

function ReportsAnalytics() {
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/reports/progress?userId=1")
      .then((res) => setProgress(res.data))
      .catch((err) => console.error("Error fetching progress:", err));
  }, []);

  return (
    <div>
      <h2>Progress Analytics</h2>
      {progress.map((habit) => (
        <div key={habit.habitId}>
          <h4>{habit.habitName}</h4>
          <ul>
            {habit.points.map((p, i) => (
              <li key={i}>
                {p.date}: {p.value ? "✅ done" : "❌ missed"}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default ReportsAnalytics;
