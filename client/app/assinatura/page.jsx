"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Lottie from "lottie-react";

// Service
import { createSubscribe } from "@/services/subscribeApi";

// Animation
import loadingAnim from "@/assets/lottie/loading.json";

export default function SubscribeForm() {
  const router = useRouter();
  const isMounted = useRef(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    isMounted.current = true;

    try {
      const raw = localStorage.getItem("resumeData");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.fullName) setName(parsed.fullName);
        if (parsed?.email) setEmail(parsed.email);
      }

      if (!email) {
        const altEmail = localStorage.getItem("email");
        if (altEmail) setEmail(altEmail);
      }
      if (!name) {
        const altName =
          localStorage.getItem("fullName") || localStorage.getItem("name");
        if (altName) setName(altName);
      }
    } catch (e) {}
    return () => {
      isMounted.current = false;
    };
  }, []);

  function validate() {
    setError("");
    if (!email || !name) {
      setError(
        "Nome e e-mail não encontrados. Atualize seus dados e tente novamente.",
      );
      return false;
    }
    if (!password || password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return false;
    }
    if (password !== confirm) {
      setError("Senhas não conferem.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    if (!validate()) return;

    setLoading(true);
    setError("");

    try {
      const payload = {
        name: name.trim(),
        email: email.trim(),
        password,
      };

      const json = await createSubscribe(payload);

      const subscribed = json.isSubscribed ?? true;

      try {
        localStorage.setItem("isSubscribed", subscribed ? "1" : "0");
      } catch {}

      if (json.user) {
        try {
          localStorage.setItem("user", JSON.stringify(json.user));
        } catch {}
      }

      if (isMounted.current) router.push("/carreira");
    } catch (err) {
      if (isMounted.current) {
        setError(err?.message || "Erro ao criar conta");
      }
    } finally {
      if (isMounted.current) setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-lg font-semibold text-gray-900">
          Criar conta
        </h1>
        <p className="mb-4 text-sm text-gray-600">
          Usaremos o nome e e-mail já preenchidos. Informe apenas uma senha
          segura.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Nome
            </label>
            <input
              type="text"
              value={name}
              readOnly
              aria-readonly
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              readOnly
              aria-readonly
              className="w-full rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                aria-required
                className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded px-2 py-1 text-sm text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Use uma senha única. Recomendado: ≥ 8 caracteres.
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">
              Confirmar senha
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded border border-gray-200 px-3 py-2 text-sm"
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60`}
          >
            {loading ? (
              <Lottie
                className="absolute size-20"
                animationData={loadingAnim}
                loop={true}
              />
            ) : (
              "Criar conta e assinar"
            )}
          </button>
        </form>
      </div>
    </main>
  );
}
