"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import PdfForm from "@/components/PdfForm";
import ResumeReviewModal from "@/components/ResumeFixModal";
import { pdfUploadSchema } from "@/schemas/pdfUploadSchema";
import { sendSkills } from "@/services/skillApi";

const SkillsPage = () => {
  const [pdfPreview, setPdfPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resume, setResume] = useState(null);
  const [showReview, setShowReview] = useState(false);

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
      if (currentObjectUrl.current)
        URL.revokeObjectURL(currentObjectUrl.current);
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
      const fd = new FormData();
      if (data.pdf && data.pdf.length > 0) fd.append("pdf", data.pdf[0]);
      if (data.skills) fd.append("skills", data.skills.trim());

      const res = await sendSkills(fd);

      setResume(res.data ?? res);

      setShowReview(true);
    } catch (err) {
      console.error("Erro no envio/extracao:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveReviewed = async (updatedResume) => {
    setShowReview(false);

    try {
      setIsLoading(true);

      setResume(updatedResume)
    } catch (err) {
      console.error("Erro ao atualizar currículo:", err);
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

      <ResumeReviewModal
        open={showReview}
        resume={resume}
        onClose={() => setShowReview(false)}
        onSave={handleSaveReviewed}
      />
    </section>
  );
};

export default SkillsPage;
