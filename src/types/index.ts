export type Locale = "en" | "bn";

export type LocationPrecision = "exact" | "approximate";

export type ReportStatus = "published" | "flagged" | "hidden" | "removed";

export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

export interface Category {
  id: string;
  label_en: string;
  label_bn: string;
  icon: string;
  sort_order: number;
}

export interface Report {
  id: string;
  created_at: string;
  updated_at: string;
  latitude: number;
  longitude: number;
  area_name: string | null;
  location_precision: LocationPrecision;
  category_id: string;
  additional_categories: string[];
  description: string | null;
  severity: number;
  time_of_day: TimeOfDay | null;
  incident_date: string | null;
  police_contacted: boolean;
  status: ReportStatus;
  flag_reason: string | null;
  is_seed: boolean;
  confirm_count: number;
  submitter_fingerprint?: string | null;
}

export interface ReportMedia {
  id: string;
  report_id: string;
  cloudinary_public_id: string;
  cloudinary_url: string;
  faces_blurred: boolean;
  created_at: string;
}

export interface NewReportInput {
  latitude: number;
  longitude: number;
  area_name?: string;
  location_precision: LocationPrecision;
  category_id: string;
  additional_categories?: string[];
  description?: string;
  severity: number;
  time_of_day?: TimeOfDay;
  incident_date?: string;
  police_contacted?: boolean;
}

export interface MapFilters {
  categoryIds: string[];
  severityMin: number;
  timeOfDay: TimeOfDay[];
  dateRange: "7d" | "30d" | "6m" | "1y" | "all";
}

export interface StatsData {
  // V2 fix, round 2: back to a single honest totalReports. This
  // intentionally counts seed AND real reports together — see
  // src/app/api/stats/route.ts for why: seed reports retire (status
  // flips to 'removed') on the same schedule they disappear from the map,
  // so this number automatically drops when the map does. No separate
  // real/seed split needed for that to stay in sync.
  totalReports: number;
  reportsToday: number;
  topAreas: { area_name: string; count: number }[];
  dayVsNight: { day: number; night: number };
  weeklyTrend: { week: string; count: number }[];
  // Added in Phase 6 for the Insights page. Optional so any existing
  // consumer typed against the pre-Phase-6 shape doesn't break — every
  // current consumer (StatsStrip.tsx) never reads these fields anyway.
  allAreas?: { area_name: string; count: number }[];
  categoryBreakdown?: { category_id: string; count: number }[];
  severityDistribution?: { severity: number; count: number }[];
}
