"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema
import { pdfUploadSchema } from "@/schemas/pdfUploadSchema";

// Services
import { sendSkills } from "@/services/SkillApi";

// Component
import PdfForm from "@/components/PdfForm";

const Skills = () => {
  const [pdfPreview, setPdfPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState(null);

  console.log(resume);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: zodResolver(pdfUploadSchema),
  });

  const pdfFile = watch("pdf");
  const currentObjectUrl = useRef(null);

  useEffect(() => {
    if (pdfFile && pdfFile.length > 0) {
      const file = pdfFile[0];
      const url = URL.createObjectURL(file);

      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
      }
      currentObjectUrl.current = url;
      setPdfPreview(url);
      return () => {
        if (currentObjectUrl.current) {
          URL.revokeObjectURL(currentObjectUrl.current);
          currentObjectUrl.current = null;
        }
      };
    } else {
      if (currentObjectUrl.current) {
        URL.revokeObjectURL(currentObjectUrl.current);
        currentObjectUrl.current = null;
      }
      setPdfPreview(null);
    }
  }, [pdfFile]);

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const skills = data.skills ? data.skills.trim() : "";

      if (!data.pdf || data.pdf.length === 0) {
        const payload = { skills };
        const res = await sendSkills(payload);
        console.log("Resposta n8n:", res);
        return;
      }

      const fd = new FormData();
      fd.append("pdf", data.pdf[0]);
      if (skills) fd.append("skills", skills);

      const res = await sendSkills(fd);
      setResume(res);
    } catch (error) {
      console.error("Erro no envio de skills:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="container mx-auto flex min-h-svh flex-col items-center justify-center py-10">
      <h2 className="headline mb-3">BEM VINDO</h2>
      <p className="mb-8">
        ATRAVÉS DAS SUAS HABILIDADES VAMOS GUIAR SUA CARREIRA
      </p>

      <PdfForm
        handleSubmit={handleSubmit(onSubmit)}
        register={register}
        errors={errors}
        pdfPreview={pdfPreview}
        isLoading={isLoading}
        pdfFile={pdfFile}
      />
    </section>
  );
};

export default Skills;
