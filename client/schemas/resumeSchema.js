import * as z from "zod";

export const resumeSchema = z.object({
  fullName: z.string().min(1, "O nome completo é obrigatório"),
  email: z.string().email("E-mail inválido").min(1, "O e-mail é obrigatório"),
  phone: z.string().min(1, "O telefone é obrigatório"),
  location: z.string().min(1, "A localização é obrigatória"),
  linkedin: z.string().min(1, "O LinkedIn é obrigatório"),
  github: z.string().min(1, "O GitHub é obrigatório"),
  portfolio: z.string().min(1, "O portfólio é obrigatório"),
  summary: z.string().min(1, "O resumo profissional é obrigatório"),
  skills: z.string().min(1, "As habilidades são obrigatórias"),
  experience: z.string().min(1, "A experiência é obrigatória"),
  education: z.string().min(1, "A formação é obrigatória"),
  certifications: z.string().min(1, "As certificações são obrigatórias"),
  languages: z.string().min(1, "Os idiomas são obrigatórios"),
});
