import { z } from "zod";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function isFileLike(obj) {
  return (
    !!obj &&
    typeof obj.name === "string" &&
    typeof obj.size === "number" &&
    typeof obj.type === "string"
  );
}

function hasPdf(files) {
  if (!files) return false;
  if (
    typeof globalThis.FileList !== "undefined" &&
    files instanceof globalThis.FileList
  ) {
    return files.length > 0;
  }
  if (Array.isArray(files)) {
    return files.length > 0 && isFileLike(files[0]);
  }
  return isFileLike(files?.[0]);
}

export const pdfUploadSchema = z
  .object({
    pdf: z.any(),
  })
  .refine(
    (data) => {
      return hasPdf(data.pdf);
    },
    {
      message: "O envio do PDF é obrigatório.",
      path: ["pdf"],
    },
  )
  .refine(
    (data) => {
      const files = data.pdf;
      if (!hasPdf(files)) return false;
      const first = Array.isArray(files) ? files[0] : files?.[0];
      if (!isFileLike(first)) return false;
      return first.type === "application/pdf";
    },
    {
      message: "O arquivo deve ser um PDF.",
      path: ["pdf"],
    },
  )
  .refine(
    (data) => {
      const files = data.pdf;
      if (!hasPdf(files)) return false;
      const first = Array.isArray(files) ? files[0] : files?.[0];
      if (!isFileLike(first)) return false;
      return first.size <= MAX_FILE_SIZE;
    },
    {
      message: "O arquivo PDF deve ter no máximo 5MB.",
      path: ["pdf"],
    },
  );
