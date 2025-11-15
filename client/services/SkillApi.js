export const sendSkills = async (body) => {
  const N8N_WEBHOOK = process.env.NEXT_PUBLIC_N8N_WEBHOOK;
  if (!N8N_WEBHOOK) throw new Error("N8N_WEBHOOK não configurado");

  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const fetchOpts = {
    method: "POST",
  };

  if (isForm) {
    fetchOpts.body = body;
  } else {
    fetchOpts.body = JSON.stringify(body);
    fetchOpts.headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  try {
    const res = await fetch(N8N_WEBHOOK, fetchOpts);
    const data = await res.text().catch(() => "");
    if (!res.ok) {
      console.error("n8n retornou erro:", res.status, text);
      throw new Error(`n8n retornou ${res.status}: ${text}`);
    }

    try {
      const json = JSON.parse(data);
      return json;
    } catch {
      return data;
    }
  } catch (err) {
    console.error("Falha ao chamar webhook n8n:", err);
    throw err;
  }
};
