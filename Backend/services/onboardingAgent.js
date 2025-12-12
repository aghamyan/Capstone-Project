import { ChatAnthropic } from "@langchain/anthropic";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";

const CLAUDE_MODEL = process.env.CLAUDE_ONBOARDING_MODEL || process.env.CLAUDE_MODEL || "claude-3-haiku-20240307";
const CLAUDE_FALLBACK_MODEL = process.env.CLAUDE_ONBOARDING_FALLBACK || "claude-3-haiku-20240307";
const CLAUDE_BASE_URL = (process.env.CLAUDE_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");
const API_KEY = process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.AI_API_KEY;

const allowedFields = [
  "primaryGoal",
  "focusArea",
  "experienceLevel",
  "dailyCommitment",
  "supportPreference",
  "motivation",
];

const fallbackQuestions = [
  {
    field: "primaryGoal",
    question: "What are you hoping to improve most right now — sport, lifestyle, or productivity?",
    suggestions: ["Sport routine", "Lifestyle balance", "Productivity boost"],
  },
  {
    field: "focusArea",
    question: "Which area should we focus on first?",
    suggestions: ["Energy", "Focus", "Recovery", "Mindfulness"],
  },
  {
    field: "dailyCommitment",
    question: "How much time can you commit each day?",
    suggestions: ["5 minutes", "15 minutes", "30 minutes", "Flexible"],
  },
  {
    field: "experienceLevel",
    question: "How experienced are you with building habits?",
    suggestions: ["Just starting", "Finding my rhythm", "Leveling up", "Habit pro"],
  },
  {
    field: "supportPreference",
    question: "What style of support helps you stick with habits?",
    suggestions: ["Gentle nudges", "Focused reminders", "Deep insights", "Celebrate wins"],
  },
  {
    field: "motivation",
    question: "What’s motivating you to start now?",
    suggestions: ["Feel stronger", "Reduce stress", "Improve focus", "Healthier routine"],
  },
];

const toJson = (content) => {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part?.text === "string" ? part.text : part?.toString?.() || ""))
      .join("\n");
  }
  return JSON.stringify(content || "");
};

const fallbackResponse = (answers = []) => {
  const answered = new Set((answers || []).map((item) => item.field).filter(Boolean));
  const next = fallbackQuestions.find((item) => !answered.has(item.field));

  if (!next) {
    return {
      done: true,
      field: null,
      question: "Thanks! We’ve got what we need. Ready to finish signup?",
      suggestions: [],
    };
  }

  return {
    ...next,
    done: false,
  };
};

const normalizeQuestion = (data, answers) => {
  const draft = data || {};
  const field = allowedFields.includes(draft.field) ? draft.field : fallbackResponse(answers).field;
  const done = Boolean(draft.done);
  const question = typeof draft.question === "string" && draft.question.trim()
    ? draft.question.trim()
    : fallbackResponse(answers).question;
  const suggestions = Array.isArray(draft.suggestions)
    ? draft.suggestions.filter(Boolean).slice(0, 5)
    : fallbackResponse(answers).suggestions;

  return {
    field,
    question,
    suggestions,
    done,
  };
};

export const generateOnboardingQuestion = async ({ answers = [], name = "friend" }) => {
  const safeAnswers = Array.isArray(answers) ? answers : [];
  if (!API_KEY) {
    return fallbackResponse(safeAnswers);
  }

  const chat = new ChatAnthropic({
    apiKey: API_KEY,
    baseURL: CLAUDE_BASE_URL,
    model: CLAUDE_MODEL,
    temperature: 0.4,
    maxTokens: 256,
  });

  const systemPrompt = [
    "You are a friendly, concise onboarding guide for StepHabit.",
    "Ask one short, adaptive question at a time to learn the user's goals (sport, lifestyle, productivity).",
    "Keep tone warm and minimal. Never ask for passwords or contact details.",
    "ALWAYS respond with strict JSON: {\"question\": string, \"field\": one of",
    `${allowedFields.join(",")}, \"suggestions\": [string], \"done\": boolean}.",
    "Use previous answers to tailor the next follow-up. Keep questions under 120 characters.",
  ].join(" ");

  const payload = {
    name,
    answers: safeAnswers,
  };

  try {
    const response = await chat.invoke([
      new SystemMessage(systemPrompt),
      new HumanMessage(JSON.stringify(payload)),
    ]);

    const raw = toJson(response.content);
    const parsed = JSON.parse(raw);
    return normalizeQuestion(parsed, safeAnswers);
  } catch (error) {
    console.error("Onboarding Claude fallback triggered", error?.message || error);
    const fallback = CLAUDE_FALLBACK_MODEL && CLAUDE_FALLBACK_MODEL !== CLAUDE_MODEL;

    if (fallback) {
      try {
        const retryChat = new ChatAnthropic({
          apiKey: API_KEY,
          baseURL: CLAUDE_BASE_URL,
          model: CLAUDE_FALLBACK_MODEL,
          temperature: 0.4,
          maxTokens: 256,
        });
        const retry = await retryChat.invoke([
          new SystemMessage(systemPrompt),
          new HumanMessage(JSON.stringify(payload)),
        ]);
        const raw = toJson(retry.content);
        const parsed = JSON.parse(raw);
        return normalizeQuestion(parsed, safeAnswers);
      } catch (retryError) {
        console.error("Claude onboarding retry failed", retryError?.message || retryError);
      }
    }

    return fallbackResponse(safeAnswers);
  }
};
