import type { Category } from "@/types";

// Mirrors supabase/schema.sql categories table. Kept as a static client-side
// constant (rather than fetched every time) since categories rarely change —
// this avoids an extra network round trip on every page load. If you add/
// remove a category, update both this file and schema.sql.
export const CATEGORIES: Category[] = [
  { id: "verbal_harassment", label_en: "Verbal Harassment", label_bn: "মৌখিক হয়রানি", icon: "MessageSquareWarning", sort_order: 1 },
  { id: "catcalling", label_en: "Catcalling", label_bn: "ক্যাটকলিং", icon: "Volume2", sort_order: 2 },
  { id: "following_stalking", label_en: "Following / Stalking", label_bn: "অনুসরণ / স্টকিং", icon: "Footprints", sort_order: 3 },
  { id: "groping_physical", label_en: "Groping / Physical Contact", label_bn: "শারীরিক স্পর্শ", icon: "HandMetal", sort_order: 4 },
  { id: "indecent_exposure", label_en: "Indecent Exposure", label_bn: "অশালীন আচরণ", icon: "EyeOff", sort_order: 5 },
  { id: "assault", label_en: "Assault", label_bn: "হামলা", icon: "AlertTriangle", sort_order: 6 },
  { id: "unsafe_transport", label_en: "Unsafe Transport (Bus/Rickshaw/CNG)", label_bn: "অনিরাপদ যানবাহন", icon: "Bus", sort_order: 7 },
  { id: "poor_lighting", label_en: "Poor Lighting / Isolated Area", label_bn: "অপর্যাপ্ত আলো / নির্জন এলাকা", icon: "Lightbulb", sort_order: 8 },
  { id: "unwanted_photography", label_en: "Unwanted Photography", label_bn: "অনাকাঙ্ক্ষিত ছবি তোলা", icon: "CameraOff", sort_order: 9 },
  { id: "other", label_en: "Other", label_bn: "অন্যান্য", icon: "CircleEllipsis", sort_order: 10 },
];

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export function getCategoryLabel(id: string, locale: "en" | "bn"): string {
  const cat = getCategoryById(id);
  if (!cat) return id;
  return locale === "bn" ? cat.label_bn : cat.label_en;
}

export function getSeverityColor(severity: number): string {
  if (severity >= 4) return "#8A2E2E"; // brick — high severity
  if (severity >= 3) return "#C9793E"; // amber — moderate
  return "#1D4E5F"; // mid teal — low
}
