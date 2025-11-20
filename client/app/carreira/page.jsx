"use client";

import { useEffect, useState } from "react";
import {
  Briefcase,
  TrendingUp,
  BookOpen,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

// Utils
import { extractSkills } from "@/utils/extractSkills";
import { normalizeSkillsField } from "@/utils/normalizeSkillsFields";

// Service
import { generateCarrer } from "@/services/carrerApi";

const CareerMatchCard = ({ career, rank }) => {
  const [expanded, setExpanded] = useState(false);
  const scoreColor =
    career.matchScore >= 0.8
      ? "bg-green-500"
      : career.matchScore >= 0.6
        ? "bg-yellow-500"
        : "bg-orange-500";
  const scorePercentage = Math.round(career.matchScore * 100);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl">
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-purple-600 font-bold text-white">
              #{rank}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {career.title}
              </h3>
              <p className="mt-1 text-sm text-gray-600">{career.why}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div
              className={`${scoreColor} rounded-full px-3 py-1 text-sm font-semibold text-white`}
            >
              {scorePercentage}% Match
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className={`${scoreColor} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${scorePercentage}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex w-full items-center justify-center gap-2 py-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-800"
        >
          {expanded ? "Ver menos" : "Ver detalhes"}
          <TrendingUp
            className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
            {career.missing && career.missing.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Habilidades a Desenvolver
                </h4>
                <div className="space-y-2">
                  {career.missing.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <X className="h-4 w-4 text-red-500" />
                      <span className="text-gray-700">{item.skill}</span>
                      <span
                        className={`ml-auto rounded px-2 py-1 text-xs ${
                          item.importance === "high"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {item.importance === "high"
                          ? "Alta prioridade"
                          : "Média prioridade"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {career.learningPaths && career.learningPaths.length > 0 && (
              <div>
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                  <BookOpen className="h-5 w-5 text-blue-500" />
                  Trilhas de Aprendizado
                </h4>
                <div className="space-y-2">
                  {career.learningPaths.map((path, idx) => (
                    <a href={path.link} key={idx} className="rounded-lg bg-blue-50 p-3">
                      <div className="text-sm font-medium text-gray-900">
                        {path.resource}
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                        <span>{path.notes}</span>
                        <span>•</span>
                        <span>{path.platform}</span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Carrer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCarrer = async () => {
    const resume = JSON.parse(localStorage.getItem("resumeData"));

    const normalizedSkills = normalizeSkillsField([
      extractSkills(resume.skills),
      extractSkills(resume.certifications),
      resume.languages,
    ]);

    const skills = {
      name: resume.fullName,
      summary: resume.summary,
      skills: normalizedSkills,
    };

    const res = await generateCarrer(skills);
    console.log(res);

    return res;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await getCarrer();
        setData(result);
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <section className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  const sortedCareers = [...data.careers].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  return (
    <section className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <Briefcase className="h-8 w-8 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900">
              Análise de Carreira
            </h1>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900">
              {data.candidate.name}
            </h2>
            <p className="mt-2 text-gray-600">{data.candidate.summary}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">
                  {sortedCareers.filter((c) => c.matchScore >= 0.8).length}{" "}
                  matches fortes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <span className="text-sm text-gray-600">
                  {
                    sortedCareers.filter(
                      (c) => c.matchScore >= 0.6 && c.matchScore < 0.8,
                    ).length
                  }{" "}
                  matches moderados
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Career Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {sortedCareers.map((career, index) => (
            <CareerMatchCard key={index} career={career} rank={index + 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Carrer;
