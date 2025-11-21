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
      .filter(Boolean)
      .slice(0, 5);

    const queries = new Set();

    if (requestedCareers && requestedCareers.length) {
      requestedCareers.slice(0, 3).forEach((c) => {
        queries.add(`${c} skills job market Brazil 2025`);
      });
    }

    skillNames.slice(0, 4).forEach((skill) => {
      queries.add(`${skill} career path jobs Brazil`);
    });

    if (!queries.size) {
      queries.add("tech careers Brazil 2025");
      queries.add("software jobs demand");
    }

    const queriesArray = Array.from(queries).slice(0, 6);

    const webResults = [];
    for (const q of queriesArray) {
      try {
        const result = await loadWeb(q, { 
          serpLimit: 2, 
          jobLimit: 3, 
          delayMs: 300 
        });
        webResults.push(result);
      } catch (e) {
        console.error(
          `[${agentName}] web search failed for query:`,
          q,
          e?.message || e
        );
        webResults.push({ query: q, results: [], jobs: [] });
      }
    }

    const webResultsString = webResults
      .map((w) => {
        const pagesPart = (w.results || [])
          .slice(0, 2)
          .map((r) => `${r.title} | ${r.link} | ${(r.snippet || "").slice(0, 150)}`)
          .join(" ; ");

        const jobsPart = (w.jobs || [])
          .slice(0, 3)
          .map((j) => {
            const company = j.company ? ` at ${j.company}` : "";
            const location = j.location ? ` | ${j.location}` : "";
            return `${j.title}${company}${location} | ${j.link}`;
          })
          .join(" ; ");

        const parts = [`Query: ${w.query}`];
        if (pagesPart) parts.push(`PAGES: ${pagesPart}`);
        if (jobsPart) parts.push(`JOBS: ${jobsPart}`);
        return parts.join(" -> ");
      })
      .join("\n");

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
