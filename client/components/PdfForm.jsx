"use client";

import Lottie from "lottie-react";

// Animation
import loadingAnim from "@/assets/lottie/loading.json";

const PdfForm = ({
  register,
  handleSubmit,
  errors,
  pdfPreview,
  isLoading,
  pdfFile,
}) => {
  return (
    <form
      onSubmit={handleSubmit}
      className="h-full w-full space-y-6 rounded-lg border border-zinc-900/50 p-5 shadow-2xl bg-blue-light"
    >
      <div className="">
        {/* PDF */}
        <div className="space-y-2">
          <label htmlFor="pdf" className="block font-medium">
            Arquivo PDF
          </label>
          <input
            id="pdf"
            type="file"
            accept="application/pdf"
            {...register("pdf")}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {errors.pdf && (
            <p className="text-sm text-red-500">{String(errors.pdf.message)}</p>
          )}
        </div>

        {/* Preview */}
        {pdfPreview && (
          <div className="space-y-2">
            <h3 className="font-medium">Preview do PDF:</h3>
            <iframe
              src={pdfPreview}
              className="h-80 w-full rounded-md border border-zinc-300"
              title="PDF Preview"
            />
            <p className="text-sm text-zinc-600">
              Arquivo: {pdfFile?.[0]?.name} (
              {(pdfFile?.[0]?.size / 1024).toFixed(2)} KB)
            </p>
          </div>
        )}
      </div>

      <p className="text-center">OU</p>

      <div className="">
        <label className="block font-medium" htmlFor="skills">
          Descreva suas habilidades:
        </label>
        <textarea
          id="skills"
          {...register("skills")}
          className="w-full rounded-md border border-zinc-300 px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          rows={4}
          placeholder="Liste seus conhecimentos, certificados e outros aqui"
        />
        {errors.skills && (
          <p className="text-sm text-red-500">
            {String(errors.skills.message)}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="bg-blue-dark border-blue-dark hover:text-blue-dark relative flex h-14 w-full items-center justify-center rounded-md border-2 py-3 font-medium text-white transition-colors duration-300 hover:bg-transparent"
      >
        {isLoading ? (
          <Lottie
            className="absolute size-20"
            animationData={loadingAnim}
            loop={true}
          />
        ) : (
          "ENVIAR"
        )}
      </button>
    </form>
  );
};

export default PdfForm;
