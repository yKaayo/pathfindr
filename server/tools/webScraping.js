import fetch from "node-fetch";
import { load } from "cheerio";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const CACHE = new Map();
const ALLOWED_DOMAINS = [
  "developer.mozilla.org",
  "w3schools.com",
  "geeksforgeeks.org",
  "github.com",
  "medium.com",
].map((d) => d.replace(/^https?:\/\//, ""));

function domainFromUrl(u) {
  try {
    return new URL(u).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function serpapiSearch(query, num = 3) {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY não configurado");
  const cacheKey = `serp:${query}:${num}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: SERPAPI_KEY,
    hl: "pt",
  });
  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const res = await fetch(url, { method: "GET", timeout: 20000 });
  if (!res.ok) throw new Error(`SerpAPI erro ${res.status}`);
  const json = await res.json();
  const organic = json.organic_results || [];
  const results = organic
    .slice(0, num)
    .map((r) => ({
      title: r.title || "",
      link: r.link || r.source || "",
      snippet: (r.snippet || r.rich_snippet?.top?.body || "")
        .replace(/\s+/g, " ")
        .trim(),
    }))
    .filter((x) => x.link);
  CACHE.set(cacheKey, results);
  return results;
}

async function getJobListings(query, num = 5) {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY não configurado");
  const cacheKey = `jobs:${query}:${num}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: SERPAPI_KEY,
    hl: "pt",
  });
  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const res = await fetch(url, { method: "GET", timeout: 20000 });
  if (!res.ok) throw new Error(`SerpAPI erro ${res.status}`);
  const json = await res.json();

  // If SerpAPI exposes jobs_results, prefer it
  const jobs = [];
  if (Array.isArray(json.jobs_results) && json.jobs_results.length) {
    for (const j of json.jobs_results.slice(0, num)) {
      jobs.push({
        title: j.title || "",
        company: j.employer || j.source || "",
        location: j.location || "",
        link: j.link || "",
        snippet: (j.snippet || "").replace(/\s+/g, " ").trim(),
        source: j.source || "unknown",
      });
    }
  } else {
    const organic = json.organic_results || [];
    const jobDomains = [
      "linkedin.com",
      "indeed.com",
      "glassdoor.com",
      "ziprecruiter.com",
      "vagas.com.br",
      "trampos.co",
    ];
    for (const r of organic.slice(0, num * 2)) {
      const link = r.link || r.source || "";
      if (!link) continue;
      const host = domainFromUrl(link) || "";
      if (jobDomains.some((d) => host.includes(d))) {
        const title = r.title || "";
        const snippet = (r.snippet || "").replace(/\s+/g, " ").trim();

        let company = "";
        let location = "";

        const parts = snippet
          .split(/[-—|•]/)
          .map((p) => p.trim())
          .filter(Boolean);
        if (parts.length >= 2) {
          company = parts[0];
          location = parts[1];
        }
        jobs.push({ title, company, location, link, snippet, source: host });
      }
      if (jobs.length >= num) break;
    }
  }

  CACHE.set(cacheKey, jobs.slice(0, num));
  return jobs.slice(0, num);
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; PathfindrBot/1.0; +https://example.com)",
        "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      timeout: 15000,
    });
    if (!res.ok) {
      return { error: new Error(`fetch erro ${res.status} para ${url}`) };
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/pdf")) return { isPdf: true };
    const html = await res.text();
    return { isPdf: false, html, contentType };
  } catch (err) {
    return { error: err };
  }
}

function extractPageData(html, url) {
  const $ = load(html);
  const title = ($("title").first().text() || "").trim();
  const metaDescription = (
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    ""
  ).trim();
  const h1 = ($("h1").first().text() || "").trim();
  const paragraphs = [];
  $("p").each((i, el) => {
    if (paragraphs.length >= 3) return;
    const text = $(el).text().trim();
    if (text.length > 30) paragraphs.push(text);
  });
  const bullets = [];
  $("ul li").each((i, el) => {
    if (bullets.length >= 8) return;
    const t = $(el).text().trim();
    if (t && t.length > 10) bullets.push(t);
  });
  const snippetParts = [];
  if (h1) snippetParts.push(h1);
  if (metaDescription) snippetParts.push(metaDescription);
  if (paragraphs.length) snippetParts.push(paragraphs[0]);
  if (bullets.length) snippetParts.push(bullets.slice(0, 3).join(" — "));
  const snippet = snippetParts.join(" ").slice(0, 500);
  return {
    title: title || metaDescription || url,
    link: url,
    snippet,
    h1,
    metaDescription,
    paragraphs,
    bullets,
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function loadWeb(
  input,
  opts = { serpLimit: 3, delayMs: 250, jobLimit: 5 }
) {
  try {
    try {
      const maybeUrl = new URL(input);
      const host = maybeUrl.hostname.replace(/^www\./, "");
      if (ALLOWED_DOMAINS.includes(host)) {
        const fh = await fetchHtml(input);
        if (fh.error)
          return {
            query: input,
            results: [{ title: input, link: input, snippet: "fetch failed" }],
            jobs: [],
          };
        if (fh.isPdf)
          return {
            query: input,
            results: [
              {
                title: input.split("/").pop(),
                link: input,
                snippet: "PDF (não baixado)",
              },
            ],
            jobs: [],
          };
        return {
          query: input,
          results: [extractPageData(fh.html, input)],
          jobs: [],
        };
      } else {
        return {
          query: input,
          results: [
            { title: input, link: input, snippet: "Link (não fetchado)" },
          ],
          jobs: [],
        };
      }
    } catch {}

    const serpResults = await serpapiSearch(input, opts.serpLimit || 3);
    const results = [];
    for (const r of serpResults) {
      const host = domainFromUrl(r.link);
      if (host && ALLOWED_DOMAINS.includes(host)) {
        const fh = await fetchHtml(r.link);
        if (fh.error)
          results.push({
            title: r.title || r.link,
            link: r.link,
            snippet: r.snippet || "",
          });
        else if (fh.isPdf)
          results.push({
            title: r.title || r.link,
            link: r.link,
            snippet: "PDF (não baixado)",
          });
        else results.push(extractPageData(fh.html, r.link));
      } else {
        results.push({
          title: r.title || r.link,
          link: r.link,
          snippet: r.snippet || "",
        });
      }
      if (opts.delayMs) await sleep(opts.delayMs);
    }

    const jobs = await getJobListings(input, opts.jobLimit || 5);

    return { query: input, results, jobs };
  } catch (err) {
    console.error("Erro em loadWeb:", input, err);
    return { query: input, results: [], jobs: [] };
  }
}
