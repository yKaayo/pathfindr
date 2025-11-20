import { SerpAPI } from "@langchain/community/tools/serpapi";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";

const SERPAPI_KEY = process.env.SERPAPI_KEY;

async function searchWithSerpAPI(query, numResults = 5) {
  if (!SERPAPI_KEY) throw new Error("SERPAPI_KEY não configurado");

  const serpapi = new SerpAPI(SERPAPI_KEY, {
    hl: "pt",
    gl: "br",
  });

  try {
    const result = await serpapi.call(query);
    const lines = result.split("\n").filter(Boolean);

    const results = [];
    let currentItem = {};

    lines.forEach((line) => {
      if (line.includes("http")) {
        if (currentItem.snippet) {
          results.push(currentItem);
          currentItem = {};
        }
        currentItem.link = line.trim();
      } else if (line.trim() && !currentItem.title) {
        currentItem.title = line.trim();
      } else if (line.trim()) {
        currentItem.snippet = (currentItem.snippet || "") + " " + line.trim();
      }
    });

    if (currentItem.link) results.push(currentItem);

    return {
      query,
      results: results.slice(0, numResults).map((r) => ({
        title: r.title || r.link,
        link: r.link,
        snippet: (r.snippet || "").slice(0, 500),
      })),
    };
  } catch (error) {
    console.error(`Erro SerpAPI para query "${query}":`, error.message);
    return { query, results: [] };
  }
}

/**
 * Usa CheerioWebBaseLoader do LangChain para fazer scraping
 * (Opcional - use só se realmente precisar do conteúdo completo)
 */
async function loadPageWithCheerio(url) {
  try {
    const loader = new CheerioWebBaseLoader(url, {
      selector: "p, h1, h2, h3, ul li",
    });

    const docs = await loader.load();

    if (!docs || docs.length === 0) {
      return {
        title: url,
        link: url,
        snippet: "Conteúdo não disponível",
      };
    }

    const content = docs[0].pageContent;

    return {
      title: docs[0].metadata?.title || url,
      link: url,
      snippet: content.slice(0, 500),
      fullContent: content,
    };
  } catch (error) {
    console.error(`Erro ao carregar ${url}:`, error.message);
    return {
      title: url,
      link: url,
      snippet: "Erro ao carregar página",
    };
  }
}

/**
 * Função principal - usa apenas SerpAPI
 * Mais rápido, confiável e sem bloqueios
 */
export async function loadWeb(input, opts = { numResults: 5 }) {
  try {
    // Verifica se é URL
    try {
      new URL(input);
      // Se for URL, tenta carregar com Cheerio
      const page = await loadPageWithCheerio(input);
      return { query: input, results: [page] };
    } catch (errUrl) {
      // Não é URL, trata como query
    }

    // Busca com SerpAPI (retorna snippets prontos)
    return await searchWithSerpAPI(input, opts.numResults || 5);
  } catch (err) {
    console.error("Erro ao carregar input:", input, err);
    return { query: input, results: [] };
  }
}
