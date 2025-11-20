import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

export async function loadPDF(pdfPath) {
  try {
    const loader = new PDFLoader(pdfPath);
    const docs = await loader.load();

    const pdfContent = docs.map((doc) => doc.pageContent).join("\n\n");

    return pdfContent;
  } catch (error) {
    console.error("Erro ao carregar PDF:", error);
    throw error;
  }
}
