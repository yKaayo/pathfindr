import fetch from "node-fetch";
import { load } from "cheerio";

const SERPAPI_KEY = process.env.SERPAPI_KEY;
const CACHE = new Map();
const CACHE_TTL = 3600000; // 1 hora em ms
const REQUEST_DELAY = 500; // 500ms entre requisições

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

function getCachedOrNull(key) {
  const cached = CACHE.get(key);
  if (!cached) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL) {
    CACHE.delete(key);
    return null;
  }
  return cached.data;
}

function setCached(key, data) {
  CACHE.set(key, { data, timestamp: Date.now() });
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function serpapiSearch(query, num = 2) {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY não configurado");

  const cacheKey = `serp:${query}:${num}`;
  const cached = getCachedOrNull(cacheKey);
  if (cached) return cached;

  await sleep(REQUEST_DELAY);

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: SERPAPI_KEY,
    hl: "pt",
    num: Math.min(num + 2, 5),
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const res = await fetch(url, { method: "GET", timeout: 10000 });

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
        .trim()
        .slice(0, 200),
    }))
    .filter((x) => x.link);

  setCached(cacheKey, results);
  return results;
}

async function getJobListings(query, num = 3) {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY não configurado");

  const cacheKey = `jobs:${query}:${num}`;
  const cached = getCachedOrNull(cacheKey);
  if (cached) return cached;

  await sleep(REQUEST_DELAY);

  const params = new URLSearchParams({
    engine: "google",
    q: query,
    api_key: SERPAPI_KEY,
    hl: "pt",
  });

  const url = `https://serpapi.com/search.json?${params.toString()}`;
  const res = await fetch(url, { method: "GET", timeout: 10000 });

  if (!res.ok) throw new Error(`SerpAPI erro ${res.status}`);

  const json = await res.json();
  const jobs = [];

  if (Array.isArray(json.jobs_results) && json.jobs_results.length) {
    for (const j of json.jobs_results.slice(0, num)) {
      jobs.push({
        title: j.title || "",
        company: j.employer || j.source || "",
        location: j.location || "",
        link: j.link || "",
        snippet: (j.snippet || "").replace(/\s+/g, " ").trim().slice(0, 150),
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
    ];

    for (const r of organic.slice(0, num * 3)) {
      const link = r.link || r.source || "";
      if (!link) continue;

      const host = domainFromUrl(link) || "";
      if (jobDomains.some((d) => host.includes(d))) {
        const title = r.title || "";
        const snippet = (r.snippet || "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 150);

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

  setCached(cacheKey, jobs.slice(0, num));
  return jobs.slice(0, num);
}

async function fetchHtml(url) {
  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "PathfindrBot/1.0",
        "Accept-Language": "pt-BR,pt;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
      timeout: 8000,
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
  const title = ($("title").first().text() || "").trim().slice(0, 100);
  const metaDescription = (
    $('meta[name="description"]').attr("content") ||
    $('meta[property="og:description"]').attr("content") ||
    ""
  )
    .trim()
    .slice(0, 150);

  const h1 = ($("h1").first().text() || "").trim().slice(0, 100);

  const paragraphs = [];
  $("p").each((i, el) => {
    if (paragraphs.length >= 2) return false;
    const text = $(el).text().trim();
    if (text.length > 50) paragraphs.push(text.slice(0, 200));
  });

  const bullets = [];
  $("ul li").each((i, el) => {
    if (bullets.length >= 5) return false;
    const t = $(el).text().trim();
    if (t && t.length > 10) bullets.push(t.slice(0, 100));
  });

  const snippetParts = [];
  if (h1) snippetParts.push(h1);
  if (metaDescription) snippetParts.push(metaDescription);
  if (paragraphs.length) snippetParts.push(paragraphs[0]);
  if (bullets.length) snippetParts.push(bullets.slice(0, 2).join(" — "));

  const snippet = snippetParts.join(" ").slice(0, 300);

  return {
    title: title || metaDescription || url,
    link: url,
    snippet,
    h1,
    metaDescription,
    paragraphs: paragraphs.slice(0, 2),
    bullets: bullets.slice(0, 3),
  };
}

export async function loadWeb(
  input,
  opts = { serpLimit: 2, delayMs: 300, jobLimit: 3 }
) {
  try {
    try {
      const maybeUrl = new URL(input);
      const host = maybeUrl.hostname.replace(/^www\./, "");
      if (ALLOWED_DOMAINS.includes(host)) {
        const fh = await fetchHtml(input);
        if (fh.error) {
          return {
            query: input,
            results: [{ title: input, link: input, snippet: "fetch failed" }],
            jobs: [],
          };
        }
        if (fh.isPdf) {
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
        }
        return {
          query: input,
          results: [extractPageData(fh.html, input)],
          jobs: [],
        };
      }
    } catch {}

    const serpLimit = Math.min(opts.serpLimit || 2, 2);
    const jobLimit = Math.min(opts.jobLimit || 3, 3);

    const serpResults = await serpapiSearch(input, serpLimit);
    const results = [];

    for (const r of serpResults.slice(0, 2)) {
      const host = domainFromUrl(r.link);
      if (host && ALLOWED_DOMAINS.includes(host)) {
        const fh = await fetchHtml(r.link);
        if (fh.error || fh.isPdf) {
          results.push({
            title: r.title || r.link,
            link: r.link,
            snippet: r.snippet || (fh.isPdf ? "PDF" : "fetch error"),
          });
        } else {
          results.push(extractPageData(fh.html, r.link));
        }
      } else {
        results.push({
          title: r.title || r.link,
          link: r.link,
          snippet: r.snippet || "",
        });
      }
      await sleep(100);
    }

    const jobs = await getJobListings(input, jobLimit);

    return { query: input, results, jobs };
  } catch (err) {
    console.error("Erro em loadWeb:", input, err?.message || err);
    return { query: input, results: [], jobs: [] };
  }
}
