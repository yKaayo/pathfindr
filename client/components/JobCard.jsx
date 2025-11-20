"use client";

import { useState } from "react";
import {
  ExternalLink,
  MapPin,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";

const JobCard = ({ job, index, isSubscribed = false, onSubscribe }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const host = (() => {
    try {
      return new URL(job.link).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const handleCta = () => {
    if (onSubscribe) return onSubscribe();
    router.push("/assinatura");
  };

  return (
    <article
      className="relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
      aria-labelledby={`job-title-${index}`}
    >
      <div className="p-4 md:p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-blue-500 to-purple-600 font-semibold text-white">
            <Briefcase className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h3
              id={`job-title-${index}`}
              className="text-sm font-semibold text-gray-900"
            >
              <a
                href={isSubscribed ? job.link || "#" : "#"}
                target={isSubscribed ? "_blank" : undefined}
                rel={isSubscribed ? "noopener noreferrer" : undefined}
                className={`inline-flex items-center gap-2 hover:underline ${!isSubscribed ? "pointer-events-none" : ""}`}
              >
                {job.title || "Vaga sem título"}
                <ExternalLink className="h-4 w-4 text-gray-400" />
              </a>
            </h3>

            <div className="mt-1 flex flex-col gap-1 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <span className="truncate">
                  {job.company || "Empresa não informada"}
                </span>
                <span aria-hidden className="mx-1">
                  •
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">
                    {job.location || "Localidade não informada"}
                  </span>
                </span>
              </div>

              {host && (
                <div className="text-xxs truncate text-gray-400">{host}</div>
              )}
            </div>
          </div>

          <div className="ml-3 flex shrink-0 items-center">
            <button
              type="button"
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              className="inline-flex items-center gap-2 rounded-md bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100"
            >
              {open ? "Fechar" : "Detalhes"}
              {open ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {open && (
          <div className="mt-4 border-t pt-4 text-sm text-gray-700">
            {job.whyMatch && (
              <p className="mb-3 text-sm text-gray-800">
                <strong>Por que corresponde:</strong> {job.whyMatch}
              </p>
            )}

            {job.evidence && job.evidence.length > 0 && (
              <div className="mb-3">
                <h4 className="mb-2 text-xs font-semibold text-gray-600 uppercase">
                  Evidências
                </h4>
                <ul className="space-y-2">
                  {job.evidence.map((ev, i) => (
                    <li key={i} className="rounded-md bg-gray-50 p-2">
                      <a
                        href={isSubscribed ? ev.link || "#" : "#"}
                        target={isSubscribed ? "_blank" : undefined}
                        rel={isSubscribed ? "noopener noreferrer" : undefined}
                        className={`block text-sm font-medium text-gray-900 hover:underline ${!isSubscribed ? "pointer-events-none" : ""}`}
                      >
                        {ev.sourceTitle || ev.link}
                      </a>
                      {ev.snippet && (
                        <p className="mt-1 text-xs text-gray-600">
                          {ev.snippet}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              <a
                href={isSubscribed ? job.link || "#" : "#"}
                target={isSubscribed ? "_blank" : undefined}
                rel={isSubscribed ? "noopener noreferrer" : undefined}
                onClick={(e) => {
                  if (!isSubscribed) {
                    e.preventDefault();
                    handleCta();
                  }
                }}
                className={`inline-flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold ${
                  isSubscribed
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border bg-white text-gray-800"
                }`}
              >
                {isSubscribed ? (
                  "Ver vaga"
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Assine para ver
                  </>
                )}
                <ExternalLink className="h-4 w-4" />
              </a>

              <span className="text-xs text-gray-500">
                Fonte: {job.source || host || "desconhecida"}
              </span>
            </div>
          </div>
        )}
      </div>

      {!isSubscribed && (
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm transition-opacity"
          onClick={handleCta}
          role="button"
        >
          <div className="flex max-w-xs flex-col items-center gap-3 rounded-lg border border-dashed border-gray-200 bg-white/80 p-4 text-center shadow-sm">
            <Lock className="h-6 w-6 text-gray-700" />
            <div className="text-sm font-medium text-gray-900">
              Vagas apenas para assinantes
            </div>
            <div className="text-xs text-gray-600">
              Assine para desbloquear todas as vagas e links completos.
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCta();
              }}
              className="mt-2 inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Assinar
            </button>
          </div>
        </div>
      )}
    </article>
  );
};

export default JobCard;
