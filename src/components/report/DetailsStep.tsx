"use client";

import { useI18n } from "@/lib/i18n/context";
import { Textarea } from "@/components/ui/Input";
import { ImagePlus, X, ShieldCheck } from "lucide-react";

export function DetailsStep({
  description,
  policeContacted,
  photos,
  onDescriptionChange,
  onPoliceChange,
  onPhotosChange,
}: {
  description: string;
  policeContacted: boolean;
  photos: File[];
  onDescriptionChange: (v: string) => void;
  onPoliceChange: (v: boolean) => void;
  onPhotosChange: (files: File[]) => void;
}) {
  const { t } = useI18n();

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    onPhotosChange([...photos, ...files].slice(0, 4));
  }

  function removePhoto(index: number) {
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="animate-fade-in space-y-7">
      <div>
        <h2 className="text-heading text-[var(--color-primary)]">
          {t("report.description.title")}
        </h2>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("report.description.placeholder")}
          rows={4}
          maxLength={2000}
          className="mt-3"
        />
        <div className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-[var(--color-text-muted)]">
          <ShieldCheck size={13} className="mt-0.5 flex-none" />
          <span>{t("report.disclaimer")}</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3.5 transition-colors hover:border-[var(--color-primary)]/40">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {t("report.police.title")}
        </span>
        <input
          type="checkbox"
          checked={policeContacted}
          onChange={(e) => onPoliceChange(e.target.checked)}
          className="h-5 w-5 accent-[var(--color-primary)]"
        />
      </label>

      <div>
        <h2 className="text-heading text-[var(--color-primary)]">
          {t("report.photos.title")}
        </h2>
        <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-muted)]">
          {t("report.photos.hint")}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {photos.map((file, i) => (
            <div
              key={i}
              className="group relative h-20 w-20 overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] shadow-[var(--shadow-xs)]"
            >
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Remove photo"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-primary)] text-white opacity-90 transition-all hover:scale-110 hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < 4 && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] text-[var(--color-text-muted)] transition-all duration-[var(--duration-base)] hover:border-[var(--color-primary)] hover:bg-[var(--color-hover-tint)] hover:text-[var(--color-primary)]">
              <ImagePlus size={20} />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          )}
        </div>
      </div>
    </div>
  );
}
