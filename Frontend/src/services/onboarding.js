import api from "./api";

export const fetchOnboardingQuestion = async ({ name, answers, userId = null }) => {
  const response = await api.post("/onboarding/ask", {
    name,
    answers,
    userId,
  });
  return response.data;
};
