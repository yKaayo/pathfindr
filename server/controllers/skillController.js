import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";

// Agent
import { extract } from "../agents/pdfExtractorAgent.js";

// Model
import { SkillModel } from "../models/skillModel.js";

export const extractSkills = async (req, rep) => {
  let filePath = null;

  try {
    const data = await req.file();

    if (!data) {
      return rep.status(400).send({
        success: false,
        error: "Nenhum arquivo foi enviado",
      });
    }

    if (data.mimetype !== "application/pdf") {
      return rep.status(400).send({
        success: false,
        error: "Apenas arquivos PDF são aceitos",
      });
    }

    const uploadDir = path.join(process.cwd(), "data", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${data.filename}`;
    filePath = path.join(uploadDir, filename);

    await pipeline(data.file, createWriteStream(filePath));

    const extractedData = await extract(filePath);

    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    const skillModel = new SkillModel();
    await skillModel.create(extractedData);

    return rep.status(200).send({
      success: true,
      data: extractedData,
      message: "Dados extraídos com sucesso",
    });
  } catch (error) {
    console.error("Erro ao extrair skills:", error);

    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        console.log("🗑️  Arquivo deletado após erro:", filePath);
      } catch (unlinkError) {
        console.error("Erro ao deletar arquivo:", unlinkError);
      }
    }

    return rep.status(500).send({
      success: false,
      error: "Erro ao processar PDF",
      details: error.message,
    });
  }
};
