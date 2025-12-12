import express from "express";
import { generateOnboardingQuestion } from "../services/onboardingAgent.js";
import { saveMessage } from "../services/memoryService.js";

const router = express.Router();

router.post("/ask", async (req, res) => {
  const { answers = [], name = "friend", userId = null } = req.body;

  try {
    const next = await generateOnboardingQuestion({ answers, name });

    if (userId && answers?.length) {
      const latest = answers[answers.length - 1];
      const summary = `${latest.question || "Question"}: ${latest.answer || "(skipped)"}`;
      await saveMessage({ userId, role: "assistant", content: summary, metadata: { onboarding: true } });
    }

    res.json(next);
  } catch (error) {
    console.error("Onboarding prompt failed", error);
    res.status(500).json({ error: "Could not generate onboarding question" });
  }
});

export default router;
