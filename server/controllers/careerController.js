import { analyseCareers } from "../agents/careerAgent.js";

const agentName = "CareerController";

export const careerHandler = async (req, rep) => {
  try {
    const body = req.body || {};

    if (!body.skills || !Array.isArray(body.skills)) {
      return rep.status(400).send({ error: "skills (array) required" });
    }

    const candidate = {
      name: body.name || "",
      summary: body.summary || "",
      skills: body.skills,
    };

    const requestedCareers = Array.isArray(body.requestedCareers)
      ? body.requestedCareers
      : typeof body.requestedCareers === "string" &&
        body.requestedCareers.length
      ? body.requestedCareers.split(",").map((s) => s.trim())
      : [];

    const result = await analyseCareers({ candidate, requestedCareers });

    return rep.send(result);
  } catch (err) {
    console.error(`[${agentName}]`, err);
    return rep
      .status(500)
      .send({ error: "Erro interno", message: err.message });
  }
};
