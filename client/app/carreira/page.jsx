"use client";

import { useEffect, useRef, useState } from "react";
import { Briefcase, RefreshCw } from "lucide-react";
import Lottie from "lottie-react";

// Utils
import { extractSkills } from "@/utils/extractSkills";
import { normalizeSkillsField } from "@/utils/normalizeSkillsFields";

// Service
import { generateCarrer } from "@/services/carrerApi";
import { verifySubscribe } from "../../services/subscribeApi";

// Components
import CareerMatchCard from "@/components/CarrerMatchCard";
import JobCard from "@/components/JobCard";

// Animation
import loadingAnim from "@/assets/lottie/loading.json";

const CACHE_KEY = "careerCache:v1";
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 horas

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.ts || !parsed?.data) return null;
    if (Date.now() - parsed.ts > (parsed.ttl || CACHE_TTL_MS)) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(data, ttl = CACHE_TTL_MS) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ ts: Date.now(), ttl, data }),
    );
  } catch {}
}

const Carrer = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const inFlight = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const buildSkillsPayload = () => {
    const resume = JSON.parse(localStorage.getItem("resumeData") || "{}");
    const normalizedSkills = normalizeSkillsField([
      extractSkills(resume.skills),
      extractSkills(resume.certifications),
      resume.languages,
    ]);
    return {
      name: resume.fullName || "",
      summary: resume.summary || "",
      skills: normalizedSkills,
    };
  };

  const fetchCareer = async ({ force = false } = {}) => {
    if (inFlight.current && !force) return null;
    inFlight.current = true;
    if (!force) {
      const cached = readCache();
      if (cached) {
        if (isMounted.current) {
          setData(cached);
          setLoading(false);
        }
        inFlight.current = false;
        return cached;
      }
    }

    try {
      if (isMounted.current && !force) setLoading(true);
      if (isMounted.current && force) setRefreshing(true);

      const payload = buildSkillsPayload();
      const res = await generateCarrer(payload);

      writeCache(res);

      if (isMounted.current) {
        setData(res);
      }
      return res;
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      return null;
    } finally {
      inFlight.current = false;
      if (isMounted.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchCareer();

    const onStorage = (e) => {
      if (e.key === CACHE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (isMounted.current) setData(parsed.data);
        } catch {}
      }
      if (e.key === "isSubscribed") {
        if (isMounted.current) setIsSubscribed(e.newValue === "1");
      }
    };

    const verifyUserSubscribe = async () => {
      try {
        const resume = JSON.parse(localStorage.getItem("resumeData") || "{}");
        const email = (resume.email || "").trim().toLowerCase();

        const localFlag = localStorage.getItem("isSubscribed");
        if (localFlag === "1") {
          setIsSubscribed(true);
          return;
        }
        if (!email) {
          return;
        }
        const res = await verifySubscribe(email);
        if (res && res.subscribed) {
          setIsSubscribed(true);
          try {
            localStorage.setItem("isSubscribed", "1");
          } catch {}
        } else {
          setIsSubscribed(false);
          try {
            localStorage.setItem("isSubscribed", "0");
          } catch {}
        }
      } catch (err) {
        console.error("verifyUserSubscribe error:", err);

        const localFlag = localStorage.getItem("isSubscribed");
        if (localFlag === "1") setIsSubscribed(true);
      }
    };

    verifyUserSubscribe();

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  if (loading) {
    return (
      <section className="flex min-h-screen w-full items-center justify-center">
        <Lottie className="absolute" animationData={loadingAnim} loop />
      </section>
    );
  }

  if (!data?.careers) return null;

  const sortedCareers = [...data.careers].sort(
    (a, b) => b.matchScore - a.matchScore,
  );

  return (
    <section className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">
                Análise de Carreira
              </h1>
            </div>
            <div>
              <button
                className="inline-flex items-center gap-2 rounded bg-white px-3 py-2 shadow-sm"
                onClick={() => fetchCareer({ force: true })}
                disabled={refreshing}
                title="Atualizar análise"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm">
                  {refreshing ? "Atualizando..." : "Atualizar"}
                </span>
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900">
              {data.candidate?.name}
            </h2>
            <p className="mt-2 text-gray-600">{data.candidate?.summary}</p>
            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">
                  {sortedCareers.filter((c) => c.matchScore >= 0.8).length}{" "}
                  matches fortes
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
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

        {/* Job Cards */}
        {data.jobs && data.jobs.length > 0 && (
          <div className="mt-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Vagas sugeridas
              </h2>
              <p className="text-sm text-gray-600">
                {data.jobs.length} resultados
              </p>
            </div>

            <div className={`${!isSubscribed && "h-[750px]"} grid  gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
              {data.jobs.map((job, i) => (
                <JobCard
                  key={i}
                  job={job}
                  index={i}
                  isSubscribed={isSubscribed}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Carrer;
