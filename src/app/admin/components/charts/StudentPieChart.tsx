"use client";

import { useMemo, useState } from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { useTheme } from "next-themes";
import { subMonths, isAfter, startOfMonth } from "date-fns";
import { ChevronDown, Info } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/admin/components/base/tooltip/tooltip";
import type { StudentInquiry } from "@/admin/types/student-inquiry";

const RANGE_OPTIONS = [
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last 12 months", value: 12 },
];

// When hideRangeControl is true the component skips its internal month filter
// because the parent page handles date filtering globally.

// ─── Palettes ─────────────────────────────────────────────────────────────────
// iOS colors adapt per theme — these are the base (light) values used for rendering
// Dark equivalents are handled via isDark checks in chart configs
export const SERVICE_COLORS: Record<string, string> = {
  university_shortlisting: "#5856D6", // iOS Indigo
  ept: "#32ADE6",                     // iOS Cyan
  scholarship: "#FF9500",             // iOS Orange
  visa: "#34C759",                    // iOS Green
  loan: "#007AFF",                    // iOS Blue
  accommodation: "#FF2D55",           // iOS Pink
};

export const SERVICE_COLORS_DARK: Record<string, string> = {
  university_shortlisting: "#5E5CE6", // iOS Dark Indigo
  ept: "#64D2FF",                     // iOS Dark Cyan
  scholarship: "#FF9F0A",             // iOS Dark Orange
  visa: "#30D158",                    // iOS Dark Green
  loan: "#0A84FF",                    // iOS Dark Blue
  accommodation: "#FF375F",           // iOS Dark Pink
};

export const STATUS_COLORS: Record<string, string> = {
  new: "#34C759",      // iOS Green
  contacted: "#007AFF", // iOS Blue
  in_progress: "#FF9500", // iOS Orange
  closed: "#8E8E93",   // iOS Gray
};

export const STATUS_COLORS_DARK: Record<string, string> = {
  new: "#30D158",      // iOS Dark Green
  contacted: "#0A84FF", // iOS Dark Blue
  in_progress: "#FF9F0A", // iOS Dark Orange
  closed: "#636366",   // iOS Dark Gray 2
};

export const SERVICE_LABELS: Record<string, string> = {
  university_shortlisting: "University Shortlisting",
  ept: "EPT / English Test",
  scholarship: "Scholarship",
  visa: "Visa Assistance",
  loan: "Education Loan",
  accommodation: "Accommodation",
};

export const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  in_progress: "In Progress",
  closed: "Closed",
};

// ─── Slice builder ────────────────────────────────────────────────────────────
export function buildSlices(
  inquiries: { service_type: string; status: string }[],
  field: "service_type" | "status",
  labels: Record<string, string>,
  colors: Record<string, string>
) {
  const counts: Record<string, number> = {};
  inquiries.forEach((inq) => {
    const key = inq[field];
    counts[key] = (counts[key] ?? 0) + 1;
  });
  return Object.entries(counts)
    .filter(([, v]) => v > 0)
    .map(([key, value]) => ({
      id: key,
      value,
      label: labels[key] ?? key,
      color: colors[key] ?? "#94a3b8",
    }));
}

// ─── Side legend ─────────────────────────────────────────────────────────────
function SideLegend({
  items,
  total,
}: {
  items: { id: string; label: string; value: number; color: string }[];
  total: number;
}) {
  return (
    <div className="flex flex-col justify-center gap-3.5 min-w-[170px]">
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
        return (
          <div key={item.id} className="flex items-center gap-3">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight text-gray-800 dark:text-gray-200">
                {item.label}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{pct}%</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-gray-900 dark:text-gray-100">
              {item.value}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Single donut card ────────────────────────────────────────────────────────
interface DonutCardProps {
  title: string;
  subtitle: string;
  slices: { id: string; label: string; value: number; color: string }[];
  total: number;
  compact?: boolean;
  isDark: boolean;
}

export function DonutCard({
  title,
  subtitle,
  slices,
  total,
  compact = false,
  isDark,
}: DonutCardProps) {
  const empty = slices.length === 0;
  const size = compact ? 160 : 220;

  return (
    <div className="flex h-full flex-col rounded-2xl bg-white dark:bg-dark-2 p-6 shadow-sm">
      {/* Card header */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
          {title}
          <Tooltip title={title} description={subtitle} placement="top start" delay={0}>
            <TooltipTrigger>
              <Info className="h-3.5 w-3.5 text-gray-300 hover:text-violet-500 transition-colors" />
            </TooltipTrigger>
          </Tooltip>
        </h3>
        <p className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</p>
      </div>

      {empty ? (
        <div className="flex flex-1 items-center justify-center py-10">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No data available
          </p>
        </div>
      ) : (
        <div className="flex flex-1 items-center gap-6 flex-wrap sm:flex-nowrap">
          {/* Donut — overflow-hidden prevents arc bleed in dark mode */}
          <div
            className="relative shrink-0 overflow-hidden"
            style={{ width: size, height: size }}
          >
            <PieChart
              series={[
                {
                  data: slices,
                  innerRadius: size * 0.28,
                  outerRadius: size * 0.44,
                  paddingAngle: 4,
                  cornerRadius: 5,
                  startAngle: -90,
                  endAngle: 270,
                  cx: size / 2,
                  cy: size / 2,
                },
              ]}
              width={size}
              height={size}
              hideLegend
              margin={{ top: 0, bottom: 0, left: 0, right: 0 }}
              slotProps={{
                tooltip: {
                  sx: {
                    "& .MuiChartsTooltip-paper": {
                      backgroundColor: isDark ? "#3A3A3C !important" : "#ffffff !important",
                      border: isDark
                        ? "1px solid #48484A !important"
                        : "1px solid #e5e7eb !important",
                      color: isDark ? "#f3f4f6 !important" : "#111827 !important",
                      borderRadius: "10px !important",
                      boxShadow: "0 8px 24px rgb(0 0 0 / 0.25) !important",
                    },
                    "& .MuiChartsTooltip-labelCell": {
                      color: isDark ? "#aeaeb2 !important" : "#374151 !important",
                    },
                    "& .MuiChartsTooltip-valueCell": {
                      color: isDark ? "#f9fafb !important" : "#111827 !important",
                      fontWeight: "600 !important",
                    },
                  },
                },
              }}
            />
            {/* Centre total */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span
                className="font-extrabold leading-none text-gray-900 dark:text-white"
                style={{ fontSize: Math.max(20, size * 0.14) }}
              >
                {total}
              </span>
              <span className="mt-1 text-[11px] font-medium text-gray-400 dark:text-gray-500">
                total
              </span>
            </div>
          </div>

          {/* Side legend */}
          <SideLegend items={slices} total={total} />
        </div>
      )}
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface StudentPieChartProps {
  inquiries: StudentInquiry[];
  loading: boolean;
  compact?: boolean;
  /** When true, hides the internal month-range dropdown (parent controls date range) */
  hideRangeControl?: boolean;
}

// ─── Main exported component ──────────────────────────────────────────────────
export function StudentPieChart({
  inquiries: allInquiries,
  loading,
  compact = false,
  hideRangeControl = false,
}: StudentPieChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [months, setMonths] = useState(6);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const filteredInquiries = useMemo(() => {
    const cutoff = startOfMonth(subMonths(new Date(), months - 1));
    return allInquiries.filter((inq) => isAfter(new Date(inq.created_at), cutoff));
  }, [allInquiries, months]);

  const serviceSlices = useMemo(
    () => buildSlices(filteredInquiries, "service_type", SERVICE_LABELS, isDark ? SERVICE_COLORS_DARK : SERVICE_COLORS),
    [filteredInquiries, isDark]
  );

  const statusSlices = useMemo(
    () => buildSlices(filteredInquiries, "status", STATUS_LABELS, isDark ? STATUS_COLORS_DARK : STATUS_COLORS),
    [filteredInquiries, isDark]
  );

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  const currentRange = RANGE_OPTIONS.find((o) => o.value === months)!;

  return (
    <div className="space-y-4">
      {/* Range Dropdown — hidden when parent controls date range globally */}
      {!compact && !hideRangeControl && (
        <div className="flex justify-end">
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-300 dark:hover:border-violet-500"
            >
              {currentRange.label}
              <ChevronDown
                className={`h-3.5 w-3.5 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-dark-5 dark:bg-dark-3">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setMonths(opt.value);
                      setDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-xs transition ${opt.value === months
                      ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div
        className={`grid gap-4 ${compact ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}
      >
        <DonutCard
          title="Inquiries by Service"
          subtitle="Breakdown of all service types"
          slices={serviceSlices}
          total={filteredInquiries.length}
          compact={compact}
          isDark={isDark}
        />
        <DonutCard
          title="Inquiries by Status"
          subtitle="Current pipeline status"
          slices={statusSlices}
          total={filteredInquiries.length}
          compact={compact}
          isDark={isDark}
        />
      </div>
    </div>
  );
}
