"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Lock, Loader2 } from "lucide-react";

export default function AdminLoginPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(t("admin.login.error"));
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-24">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-white">
        <Lock size={20} />
      </div>
      <h1 className="font-display mt-5 text-xl font-semibold text-ink">
        {t("admin.login.title")}
      </h1>
      <form onSubmit={handleSubmit} className="mt-6 w-full space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("admin.login.password")}
          className="w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm focus:border-ink"
          autoFocus
        />
        {error && <p className="text-xs text-brick">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {t("admin.login.submit")}
        </button>
      </form>
    </div>
  );
}
