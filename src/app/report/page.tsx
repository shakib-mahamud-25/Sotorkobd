"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LocationStep, type LocationValue } from "@/components/report/LocationStep";
import { CategoryStep } from "@/components/report/CategoryStep";
import { SeverityStep } from "@/components/report/SeverityStep";
import { TimeDateStep } from "@/components/report/TimeDateStep";
import { DetailsStep } from "@/components/report/DetailsStep";
import { ReportReceipt } from "@/components/report/ReportReceipt";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { getDeviceFingerprint } from "@/lib/fingerprint";
import type { TimeOfDay } from "@/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const TOTAL_STEPS = 5;

export default function ReportPage() {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ editCode: string; reportId: string } | null>(null);

  const [location, setLocation] = useState<LocationValue | null>(null);
  const [primaryCategory, setPrimaryCategory] = useState<string | null>(null);
  const [additionalCategories, setAdditionalCategories] = useState<string[]>([]);
  const [severity, setSeverity] = useState(3);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay | null>(null);
  const [incidentDate, setIncidentDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState("");
  const [policeContacted, setPoliceContacted] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);

  function toggleAdditionalCategory(id: string) {
    setAdditionalCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  function canProceed(): boolean {
    if (step === 1) return !!location;
    if (step === 2) return !!primaryCategory;
    return true;
  }

  async function handleSubmit() {
    if (!location || !primaryCategory) return;
    setSubmitting(true);
    setError(null);

    try {
      const fingerprint = await getDeviceFingerprint();

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          area_name: location.area_name,
          location_precision: location.location_precision,
          category_id: primaryCategory,
          additional_categories: additionalCategories,
          description: description || undefined,
          severity,
          time_of_day: timeOfDay ?? undefined,
          incident_date: incidentDate,
          police_contacted: policeContacted,
          fingerprint,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        setSubmitting(false);
        return;
      }

      if (photos.length > 0) {
        await Promise.all(
          photos.map((file) => {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("reportId", data.reportId);
            return fetch("/api/upload", { method: "POST", body: formData }).catch(() => null);
          })
        );
      }

      setResult({ editCode: data.editCode, reportId: data.reportId });
    } catch {
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-16">
        <ReportReceipt editCode={result.editCode} reportId={result.reportId} />
      </div>
    );
  }

  const STEP_LABELS = [
    t("report.location.title"),
    t("report.category.title"),
    t("report.severity.title"),
    t("report.time.title"),
    t("report.description.title"),
  ];

  return (
    <div className="mx-auto max-w-2xl px-5 py-12 sm:py-16">
      <div className="mb-8 animate-fade-in-up">
        <h1 className="text-display-sm text-[var(--color-primary)]">
          {t("report.title")}
        </h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          {t("report.subtitle")}
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-[var(--color-primary)]">
            Step {step} of {TOTAL_STEPS}
          </span>
          <span className="text-xs text-[var(--color-text-muted)]">
            {STEP_LABELS[step - 1]}
          </span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]`}
            >
              <div
                className={`h-full rounded-full bg-[var(--color-primary)] transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)] ${
                  i < step ? "w-full" : "w-0"
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
        <div key={step}>
          {step === 1 && <LocationStep value={location} onChange={setLocation} />}
          {step === 2 && (
            <CategoryStep
              primaryCategory={primaryCategory}
              additionalCategories={additionalCategories}
              onPrimaryChange={setPrimaryCategory}
              onAdditionalToggle={toggleAdditionalCategory}
            />
          )}
          {step === 3 && <SeverityStep value={severity} onChange={setSeverity} />}
          {step === 4 && (
            <TimeDateStep
              timeOfDay={timeOfDay}
              incidentDate={incidentDate}
              onTimeChange={setTimeOfDay}
              onDateChange={setIncidentDate}
            />
          )}
          {step === 5 && (
            <DetailsStep
              description={description}
              policeContacted={policeContacted}
              photos={photos}
              onDescriptionChange={setDescription}
              onPoliceChange={setPoliceContacted}
              onPhotosChange={setPhotos}
            />
          )}
        </div>

        {error && (
          <div className="mt-5">
            <Alert tone="danger">{error}</Alert>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className={step === 1 ? "invisible" : ""}
          >
            <ChevronLeft size={16} />
            Back
          </Button>

          {step < TOTAL_STEPS ? (
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              type="button"
              variant="accent"
              size="lg"
              onClick={handleSubmit}
              loading={submitting}
            >
              {submitting ? t("report.submitting") : t("report.submit")}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
