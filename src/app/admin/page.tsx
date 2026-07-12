"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { Lock } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

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
    <div className="mx-auto flex max-w-sm flex-col items-center px-5 py-24 sm:py-32">
      <div className="animate-fade-in-up flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)] text-white shadow-[var(--shadow-md)]">
        <Lock size={22} />
      </div>
      <h1
        className="text-display-sm animate-fade-in-up mt-6 text-[var(--color-primary)]"
        style={{ animationDelay: "60ms" }}
      >
        {t("admin.login.title")}
      </h1>
      <form
        onSubmit={handleSubmit}
        className="animate-fade-in-up mt-8 w-full space-y-4"
        style={{ animationDelay: "120ms" }}
      >
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t("admin.login.password")}
          autoFocus
          error={!!error}
        />
        {error && <Alert tone="danger">{error}</Alert>}
        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          {t("admin.login.submit")}
        </Button>
      </form>
    </div>
  );
}
