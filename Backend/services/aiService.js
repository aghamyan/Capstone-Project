import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn(
    "OpenAI API key is not configured. Set OPENAI_API_KEY to enable AI-generated coaching advice."
  );
}

const openai = apiKey ? new OpenAI({ apiKey }) : null;

const summarizeArray = (items = [], label) => {
  if (!Array.isArray(items) || !items.length) {
    return `${label}: none provided.`;
  }

  return `${label}: ${items
    .map((item) => (typeof item === "string" ? item : item.title || item.name))
    .filter(Boolean)
    .join("; ")}.`;
};

const buildPrompt = ({ user = {}, habits = [], progressSummary = {}, schedules = [] }) => {
  const userBlock = [
    `User: ${user.name || "Unknown"}`,
    `Primary goal: ${user.primary_goal || user.goal || "Not specified"}`,
    `Focus area: ${user.focus_area || "Not specified"}`,
  ].join("\n");

  const habitsBlock = summarizeArray(habits, "Habits being tracked");

  const progressBlock = [
    "Recent performance:",
    `- Overall streak: ${progressSummary.streak || progressSummary.currentStreak || 0} days`,
    `- Completed: ${progressSummary.completed || 0}`,
    `- Missed: ${progressSummary.missed || 0}`,
    progressSummary.notes ? `- Notes: ${progressSummary.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const scheduleBlock = summarizeArray(schedules, "Upcoming schedule items");

  const guidanceBlock = [
    "You are StepHabit's concise, encouraging coach.",
    "Analyze the user's habits and recent performance to offer practical, motivating guidance.",
    "Return a short JSON-like text with keys:",
    '- "today_focus": list 2-3 top priorities for today.',
    '- "habit_tweaks": per-habit micro-suggestions.',
    '- "mindset_tip": one uplifting idea.',
    "Keep responses brief and actionable.",
  ].join("\n");

  return [guidanceBlock, "\nUser context:", userBlock, habitsBlock, progressBlock, scheduleBlock].join(
    "\n\n"
  );
};

export const generateCoachAdvice = async (payload = {}) => {
  if (!openai) {
    return "AI advice unavailable: configure OPENAI_API_KEY to enable coaching suggestions.";
  }

  const prompt = buildPrompt(payload);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a concise, empathetic habit coach for StepHabit users. Respond with focused, actionable advice.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const advice = response?.choices?.[0]?.message?.content?.trim();
    return advice || "";
  } catch (error) {
    console.error("OpenAI chat completion failed:", error);
    throw new Error("AI service unavailable");
  }
};
