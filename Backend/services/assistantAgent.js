// assistantAgent.js
// Main AI reasoning engine for StepHabit

import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, HumanMessage, SystemMessage } from "@langchain/core/messages";

const MAX_HISTORY_MESSAGES = parseInt(process.env.ASSISTANT_HISTORY_LIMIT || "12", 10);

// ---- MODEL CONFIG ----
const CLAUDE_BASE_URL = (process.env.CLAUDE_BASE_URL || "https://api.anthropic.com").replace(/\/$/, "");

const CLAUDE_MODEL = (process.env.CLAUDE_MODEL || "claude-3-5-sonnet-20241022").trim();

const CLAUDE_API_KEY = (process.env.CLAUDE_API_KEY || "").trim();

// ---- STATUS HELPERS ----
const hasApiKey = () => Boolean(CLAUDE_API_KEY);

export const getAgentStatus = () => ({
  ready: hasApiKey(),
  provider: "Anthropic Claude",
  endpoint: `${CLAUDE_BASE_URL}/v1`,
  model: hasApiKey() ? CLAUDE_MODEL : null,
  reason: hasApiKey() ? null : "Set the CLAUDE_API_KEY environment variable.",
  updatedAt: new Date().toISOString(),
});

// ---- HISTORY UTILS ----
const limitHistory = (history = []) => {
  if (!Array.isArray(history) || !history.length) return [];
  const limit = Number.isFinite(MAX_HISTORY_MESSAGES) ? Math.max(MAX_HISTORY_MESSAGES, 2) : 12;
  return history.slice(-limit);
};

// ---- SNAPSHOT FORMATTER ----
const formatList = (items = []) => items.filter(Boolean).join("; ");

const describeSnapshot = (snapshot = {}, insightText) => {
  const profile = snapshot.user || {};
  const progress = snapshot.progress || {};
  const schedules = snapshot.schedules?.upcoming || [];

  const topHabits = (progress.habitSummaries || []).slice(0, 5);
  const needsHelp = (progress.habitSummaries || []).filter(h => h.completionRate < 60).slice(0, 3);

  const lines = [
    `Name: ${profile.name || "Unknown"}`,
    `Primary goal: ${profile.primary_goal || "Not specified"}`,
    `Focus area: ${profile.focus_area || "Not set"}`,
    `Daily commitment: ${profile.daily_commitment || "Not set"}`,
    `Support preference: ${profile.support_preference || "Not set"}`,
    `Average completion: ${progress.completionRate || 0}% over ${progress.total || 0} entries`,
  ];

  if (topHabits.length) {
    lines.push(
      `Top habits: ${formatList(topHabits.map(h =>
        `${h.title} — ${h.completionRate}% (${h.completed} done, ${h.missed} missed)`
      ))}`
    );
  }

  if (needsHelp.length) {
    lines.push(
      `Habits needing focus: ${formatList(needsHelp.map(h =>
        `${h.title} — ${h.completionRate}% (${h.completed} done, ${h.missed} missed)`
      ))}`
    );
  }

  if (schedules.length) {
    lines.push(
      `Upcoming schedule: ${formatList(
        schedules.slice(0, 5).map(item =>
          `${item.habitTitle} on ${item.day} at ${item.starttime}`
        )
      )}`
    );
  }

  if (insightText) lines.push(`Recent insight: ${insightText}`);

  return lines.join("\n");
};

// ---- MESSAGE BUILDER ----
const buildMessages = ({ snapshot, insightText, history = [] }) => {
  const systemPrompt = [
    "You are StepHabit's AI companion, a motivational coach.",
    "You reason carefully about habits, schedules, and progress.",
    "Keep responses short, supportive, and actionable.",
    "Always end with a reflective or action-oriented question."
  ].join(" ");

  const contextBlock = describeSnapshot(snapshot, insightText);

  const formattedHistory = limitHistory(history).map(entry =>
    entry.role === "assistant"
      ? new AIMessage(entry.content)
      : new HumanMessage(entry.content)
  );

  return {
    systemInstruction: `${systemPrompt}\n\n${contextBlock}`,
    contents: formattedHistory,
  };
};

// ---- MAIN AGENT CALL ----
export const runReasoningAgent = async ({ snapshot, insightText, history, apiKeyOverride }) => {
  const apiKey = apiKeyOverride || CLAUDE_API_KEY;
  if (!apiKey) throw new Error("Missing CLAUDE_API_KEY.");
  if (!CLAUDE_MODEL) throw new Error("Missing CLAUDE_MODEL.");

  const { systemInstruction, contents } = buildMessages({ snapshot, insightText, history });

  let replyMessage;
  let degradedReason = null;

  try {
    const chat = new ChatAnthropic({
      apiKey,
      anthropicApiUrl: `${CLAUDE_BASE_URL}/v1`,
      model: CLAUDE_MODEL,
      temperature: 0.7,
      topP: 0.95,
      maxTokens: 1024,
    });

    replyMessage = await chat.invoke([
      new SystemMessage(systemInstruction),
      ...(contents.length ? contents : [new HumanMessage("Summarize my progress.")]),
    ]);
  } catch (err) {
    console.error("Model failed:", CLAUDE_MODEL, err?.error || err?.message);
    throw err;
  }

  const reply =
    typeof replyMessage.content === "string"
      ? replyMessage.content.trim()
      : replyMessage.content.map(p => p.text).filter(Boolean).join("\n").trim();

  if (!reply) {
    degradedReason = "AI summary was empty; using your stored insights instead.";
  }

  const safeReply = reply || insightText || describeSnapshot(snapshot, insightText);

  return {
    reply: safeReply,
    meta: {
      ready: !degradedReason,
      provider: "Anthropic Claude",
      endpoint: `${CLAUDE_BASE_URL}/v1`,
      model: CLAUDE_MODEL,
      reason: degradedReason,
      updatedAt: new Date().toISOString(),
    },
  };
};
