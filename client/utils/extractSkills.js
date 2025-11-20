export function extractSkills(text) {
  return text
    .split(":")
    .slice(1)
    .join(",")
    .split(",")
    .map((s) => s.replace(".", "").trim())
    .filter(Boolean);
}
