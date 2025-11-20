"use client";

import { useEffect, useState } from "react";
import { Briefcase } from "lucide-react";
import Lottie from "lottie-react";

// Utils
import { extractSkills } from "@/utils/extractSkills";
import { normalizeSkillsField } from "@/utils/normalizeSkillsFields";

// Service
import { generateCarrer } from "@/services/carrerApi";

// Component
import CareerMatchCard from "../../components/CarrerMatchCard";

// Animation
import loadingAnim from "@/assets/lottie/loading.json";

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
      <section className="flex min-h-screen w-full items-center justify-center">
        <Lottie className="absolute" animationData={loadingAnim} loop={true} />
      </section>
    );
  }

  if (!data.careers) return;

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
