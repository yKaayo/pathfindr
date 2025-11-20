import { llm } from "../config/langchain.js";
import { promptExtractPdf } from "../prompts/extractPdf.js";
import { loadPDF } from "../tools/pdfLoader.js";

export const extract = async (pdfPath) => {
  const agentName = "PDF Extractor";

  try {
    const pdfContent = await loadPDF(pdfPath);

    const chain = promptExtractPdf.pipe(llm);

    const response = await chain.invoke({
      pdfContent: pdfContent,
    });

    let cleanedContent = response.content.trim();

    cleanedContent = cleanedContent.replace(/```json\n?/g, "");
    cleanedContent = cleanedContent.replace(/```\n?/g, "");
    cleanedContent = cleanedContent.trim();

    const extractedData = JSON.parse(cleanedContent);

    return extractedData;
  } catch (error) {
    console.error(`[${agentName}] Erro:`, error);
    console.error(`[${agentName}] Detalhes:`, error.message);
    throw error;
  }
};
