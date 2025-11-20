import { ChatPromptTemplate } from "@langchain/core/prompts";

export const promptExtractPdf = ChatPromptTemplate.fromMessages([
  [
    "system",
    `Extract the following structured information from the PDF content I will provide.
Return only valid JSON, with every field always present.
If the PDF does not contain a value for a field, return an empty string for that field. And do not use \\n and \`\` in the return
Do not invent or assume any information that is not explicitly in the PDF.

Required JSON structure:

{{
  "fullName": "",
  "email": "",
  "phone": "",
  "location": "",
  "linkedin": "",
  "github": "",
  "portfolio": "",
  "summary": "",
  "skills": "",
  "experience": "",
  "education": "",
  "certifications": "",
  "languages": ""
}}`,
  ],
  ["human", "{pdfContent}"],
]);
