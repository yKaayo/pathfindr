"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Lottie from "lottie-react";
import { useRouter } from "next/navigation";

// Animation
import loadingAnim from "@/assets/lottie/loading.json";

// Schema
import { resumeSchema } from "@/schemas/resumeSchema";

const fieldsLabelsPT = {
  fullName: "Nome completo",
  email: "E-mail",
  phone: "Telefone",
  location: "Localização",
  linkedin: "LinkedIn",
  github: "GitHub",
  portfolio: "Portfólio",
  summary: "Resumo profissional",
  skills: "Habilidades",
  experience: "Experiência",
  education: "Formação",
  certifications: "Certificações",
  languages: "Idiomas",
};

const fieldsOrder = Object.keys(fieldsLabelsPT);

const ResumeReviewModal = ({ open = false, resume = {}, onClose, onSave }) => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: resume || {},
  });

  useEffect(() => {
    reset({
      ...resume,
    });
  }, [resume, reset]);

  const submit = async (values) => {
    localStorage.setItem("resumeData", JSON.stringify(values));
    await onSave(values);

    router.push("/carreira");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-14">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      <div className="relative z-60 max-h-[80vh] w-full max-w-3xl overflow-auto rounded-lg bg-white p-6 shadow-lg">
        <header className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Confirme seu currículo</h3>
          <button className="btn btn-ghost" onClick={onClose}>
            <Image src="/icons/close.svg" alt="Fechar" width={32} height={32} />
          </button>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          {fieldsOrder.map((key) => (
            <div key={key} className="flex flex-col">
              <label className="mb-1 font-medium">{fieldsLabelsPT[key]}</label>

              {key === "summary" ||
              key === "skills" ||
              key === "experience" ||
              key === "certifications" ||
              key === "education" ? (
                <textarea
                  {...register(key)}
                  rows={4}
                  className="input"
                  required
                  placeholder={`Digite ${fieldsLabelsPT[key].toLowerCase()}`}
                />
              ) : (
                <input
                  type="text"
                  {...register(key)}
                  className="input"
                  required
                  placeholder={`Digite ${fieldsLabelsPT[key].toLowerCase()}`}
                />
              )}

              {errors[key] && (
                <p className="mt-1 text-sm text-red-500">
                  {errors[key]?.message}
                </p>
              )}
            </div>
          ))}

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="submit"
              className="bg-blue-dark border-blue-dark hover:text-blue-dark relative flex h-14 w-full items-center justify-center rounded-md border-2 py-3 font-medium text-white transition-colors duration-300 hover:bg-transparent"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Lottie
                  className="absolute size-20"
                  animationData={loadingAnim}
                  loop={true}
                />
              ) : (
                "Continuar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeReviewModal;
