import axios from "axios";

export const sendSkills = async (body) => {
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;

  const axiosConfig = {
    method: "POST",
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/skill`,
    headers: {},
    data: null,
  };

  if (isForm) {
    axiosConfig.data = body;
  } else {
    axiosConfig.data = body;
    axiosConfig.headers["Content-Type"] = "application/json";
    axiosConfig.headers["Accept"] = "application/json";
  }

  try {
    const res = await axios(axiosConfig);

    if (typeof res.data === "string") {
      try {
        return JSON.parse(res.data);
      } catch {
        return res.data;
      }
    }

    return res.data;
  } catch (err) {
    const status = err.response?.status || "SEM_STATUS";
    const data = err.response?.data || err.message;

    console.error("Erro ao chamar a api:", status, data);

    throw new Error(
      `Retornou erro: ${status} → ${typeof data === "string" ? data : JSON.stringify(data)}`,
    );
  }
};
