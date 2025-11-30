export const promptMissedReflection = (habitTitle) => {
  const message =
    `What got in the way of "${habitTitle || "this habit"}" today?` +
    "\nShare a quick note so you can spot patterns later.";
  const response = window.prompt(message, "");
  if (response === null) return null;
  const trimmed = response.trim();
  return trimmed.length ? trimmed : null;
};
