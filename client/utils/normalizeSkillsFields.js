export function normalizeSkillsField(rawSkills) {
  if (!rawSkills) return [];

  const flat = rawSkills.flatMap((item) =>
    Array.isArray(item) ? item : [item],
  );

  const splitCandidates = flat.flatMap((item) => {
    if (typeof item !== "string") return [];
    return item.split(/[,|\/\u007C]/).map((s) => s.trim());
  });

  const cleaned = splitCandidates
    .map((s) => s.replace(/\.$/, "").trim())
    .map((s) => s.replace(/\s{2,}/g, ""))
    .filter(Boolean);

  const seen = new Map();
  for (const s of cleaned) {
    const key = s.toLowerCase();
    if (!seen.has(key)) seen.set(key, s);
  }

  return Array.from(seen.values());
}
