import { promptCareer } from "../prompts/carrer.js";
import { llm } from "../config/langchain.js";
import { loadWeb } from "../tools/webScraping.js";

export const analyseCareers = async ({ candidate, requestedCareers = [] }) => {
  const agentName = "Career Analyzer Agent";

  try {
    const skillNames = (candidate.skills || [])
      .flatMap((s) => {
        if (!s) return [];
        if (typeof s === "string") return s;
        if (typeof s === "object" && s.name) return s.name;
        return [];
      })
      .filter(Boolean);

    const queries = new Set();

    if (requestedCareers && requestedCareers.length) {
      requestedCareers.forEach((c) =>
        queries.add(`${c} demanded skills and typical learning path`)
      );
      requestedCareers.forEach((c) =>
        queries.add(`${c} job market demand Brazil 2024 2025`)
      );
    }

    skillNames.forEach((skill) => {
      queries.add(`${skill} jobs required skills certifications`);
      queries.add(`${skill} career path learning resources`);
      queries.add(`${skill} demand Brazil 2024 2025`);
    });

    if (!queries.size) {
      queries.add("technology careers high demand 2025 Brazil");
      queries.add("skills most requested software jobs 2025");
    }

    const queriesArray = Array.from(queries);

    const promises = queriesArray.map((q) =>
      loadWeb(q).catch((e) => {
        console.error(
          `[${agentName}] web search failed for query:`,
          q,
          e?.message || e
        );
        return { query: q, results: [] };
      })
    );
    const webResults = await Promise.all(promises);

    const webResultsString = webResults
      .map((w) => {
        const top = (w.results || [])
          .slice(0, 3)
          .map((r) => `${r.title} | ${r.link} | ${r.snippet}`)
          .join(" ; ");
        return `Query: ${w.query} -> ${top}`;
      })
      .join("\n\n");

    const candidateJson = JSON.stringify({
      name: candidate.name || "",
      summary: candidate.summary || "",
      skills: candidate.skills || [],
    });

    const chain = promptCareer.pipe(llm);

    const response = await chain.invoke({
      candidateJson,
      webResultsString,
      requestedCareers: (requestedCareers || []).join(", "),
    });

    let text = response?.content?.trim?.() || response?.text || "";

    text = text
      .replace(/```json\n?/g, "")
      .replace(/```/g, "")
      .trim();

    try {
      const parsed = JSON.parse(text);
      if (!parsed.meta) parsed.meta = {};
      if (!parsed.meta.generatedAt)
        parsed.meta.generatedAt = new Date().toISOString();
      if (!parsed.meta.searchProvider)
        parsed.meta.searchProvider = process.env.SEARCH_PROVIDER || "serpapi";
      if (!parsed.meta.searchQueries) parsed.meta.searchQueries = queriesArray;
      return parsed;
    } catch (err) {
      // fallback: pedir ao LLM extrair apenas JSON
      const fallbackPrompt = `O texto abaixo deve conter um JSON, mas não foi parseado. Extraia apenas o JSON válido e retorne somente o JSON.\n\n${text}`;
      const fallbackResp = await llm.call([
        { role: "user", content: fallbackPrompt },
      ]);
      const fallbackText = (fallbackResp?.text || fallbackResp?.content || "")
        .replace(/```/g, "")
        .trim();
      try {
        const parsed = JSON.parse(fallbackText);
        if (!parsed.meta) parsed.meta = {};
        if (!parsed.meta.generatedAt)
          parsed.meta.generatedAt = new Date().toISOString();
        if (!parsed.meta.searchProvider)
          parsed.meta.searchProvider = process.env.SEARCH_PROVIDER || "serpapi";
        if (!parsed.meta.searchQueries)
          parsed.meta.searchQueries = queriesArray;
        return parsed;
      } catch (err2) {
        console.error(`[${agentName}] JSON parse failed`, err2);
        throw new Error(`${agentName}: LLM did not return valid JSON`);
      }
    }
  } catch (error) {
    console.error(`[${agentName}] Erro:`, error);
    throw error;
  }
};
