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
    pdf: z.any().optional(),
    skills: z.string().optional(),
  })

  .refine(
    (data) => {
      const files = data.pdf;
      if (!hasPdf(files)) return true;
      const first = Array.isArray(files) ? files[0] : files?.[0];
      if (!isFileLike(first)) return false;
      if (first.type !== "application/pdf") return false;
      if (first.size > MAX_FILE_SIZE) return false;
      return true;
    },
    {
      message: "Arquivo inválido — apenas PDF até 5MB.",
      path: ["pdf"],
    },
  )

  .refine(
    (data) => {
      const okPdf = hasPdf(data.pdf);
      const okSkills =
        typeof data.skills === "string" && data.skills.trim().length > 0;
      return okPdf || okSkills;
    },
    {
      message:
        "Envie um PDF ou descreva suas habilidades (pelo menos 1 é obrigatório).",
      path: ["skills"],
    },
  );
