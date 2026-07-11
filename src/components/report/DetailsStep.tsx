"use client";

import { useI18n } from "@/lib/i18n/context";
import { ImagePlus, X } from "lucide-react";

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
    onPhotosChange([...photos, ...files].slice(0, 4)); // cap at 4 photos
  }

  function removePhoto(index: number) {
    onPhotosChange(photos.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("report.description.title")}
        </h2>
        <textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder={t("report.description.placeholder")}
          rows={4}
          maxLength={2000}
          className="mt-3 w-full rounded-xl border border-line bg-paper-raised px-4 py-3 text-sm leading-relaxed focus:border-ink"
        />
        <p className="mt-2 text-xs text-text-soft">{t("report.disclaimer")}</p>
      </div>

      <div>
        <label className="flex items-center justify-between rounded-xl border border-line bg-paper-raised px-4 py-3.5">
          <span className="text-sm font-medium text-ink">{t("report.police.title")}</span>
          <input
            type="checkbox"
            checked={policeContacted}
            onChange={(e) => onPoliceChange(e.target.checked)}
            className="h-5 w-5 accent-ink"
          />
        </label>
      </div>

      <div>
        <h2 className="font-display text-lg font-semibold text-ink">
          {t("report.photos.title")}
        </h2>
        <p className="mt-1 text-xs text-text-soft">{t("report.photos.hint")}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {photos.map((file, i) => (
            <div key={i} className="relative h-20 w-20 overflow-hidden rounded-xl border border-line">
              <img
                src={URL.createObjectURL(file)}
                alt=""
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink text-white"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < 4 && (
            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-line text-text-soft hover:border-ink hover:text-ink">
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
