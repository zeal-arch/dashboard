"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { useTheme } from "next-themes";
import { subMonths, isAfter, startOfMonth } from "date-fns";
import { ChevronDown, LayoutList, ArrowDownUp, Percent, Info } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/admin/components/base/tooltip/tooltip";
import type { StudentInquiry } from "@/admin/types/student-inquiry";

const RANGE_OPTIONS = [
  { label: "Last 3 months", value: 3 },
  { label: "Last 6 months", value: 6 },
  { label: "Last 12 months", value: 12 },
];

const SERVICES = [
  { key: "university_shortlisting", label: "University" },
  { key: "ept", label: "EPT" },
  { key: "scholarship", label: "Scholarship" },
  { key: "visa", label: "Visa" },
  { key: "loan", label: "Loan" },
  { key: "accommodation", label: "Accomm." },
];

const STATUSES_LIGHT = [
  { key: "new", label: "New", color: "#34C759" },
  { key: "contacted", label: "Contacted", color: "#007AFF" },
  { key: "in_progress", label: "In Progress", color: "#FF9500" },
  { key: "closed", label: "Closed", color: "#8E8E93" },
];
const STATUSES_DARK = [
  { key: "new", label: "New", color: "#30D158" },
  { key: "contacted", label: "Contacted", color: "#0A84FF" },
  { key: "in_progress", label: "In Progress", color: "#FF9F0A" },
  { key: "closed", label: "Closed", color: "#636366" },
];

// ─── Reusable dropdown ────────────────────────────────────────────────────────
function Dropdown<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const current = options.find((o) => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-300 dark:hover:border-violet-500"
      >
        {label && <span className="text-gray-400 dark:text-gray-500">{label}:</span>}
        {current?.label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-dark-5 dark:bg-dark-3">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full px-4 py-2 text-left text-xs transition ${opt.value === value
                  ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-4"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toggle pill button ───────────────────────────────────────────────────────
function TogglePill({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${active
          ? "bg-violet-600 text-white shadow"
          : "border border-gray-200 bg-white text-gray-600 hover:border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-400 dark:hover:border-violet-500"
        }`}
    >
      <Icon className="h-3 w-3" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────
export interface StudentBarChartProps {
  inquiries: StudentInquiry[];
  loading: boolean;
  hideRangeControl?: boolean;
}

export function StudentBarChart({
  inquiries: allInquiries,
  loading,
  hideRangeControl = false,
}: StudentBarChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [months, setMonths] = useState(6);
  const [stacked, setStacked] = useState(false);
  const [pctMode, setPctMode] = useState(false);
  const [sortDesc, setSortDesc] = useState(false);

  const filteredInquiries = useMemo(() => {
    if (hideRangeControl) return allInquiries;
    const cutoff = startOfMonth(subMonths(new Date(), months - 1));
    return allInquiries.filter((inq) => isAfter(new Date(inq.created_at), cutoff));
  }, [allInquiries, months, hideRangeControl]);

  const axisTickColor = isDark ? "#8E8E93" : "#6b7280";
  const axisLineColor = isDark ? "#48484A" : "#e5e7eb";
  const STATUSES = isDark ? STATUSES_DARK : STATUSES_LIGHT;

  // Build counts per service × status
  const serviceTotals = useMemo(() => {
    return SERVICES.map((svc) => ({
      ...svc,
      total: filteredInquiries.filter((i) => i.service_type === svc.key).length,
    }));
  }, [filteredInquiries]);

  const orderedServices = useMemo(() => {
    const sorted = [...serviceTotals];
    if (sortDesc) sorted.sort((a, b) => b.total - a.total);
    return sorted;
  }, [serviceTotals, sortDesc]);

  const series = useMemo(() => {
    return STATUSES.map(({ key, label, color }) => ({
      label,
      color,
      stack: stacked ? "total" : undefined,
      data: orderedServices.map((svc) => {
        const count = filteredInquiries.filter(
          (inq) => inq.service_type === svc.key && inq.status === key
        ).length;
        if (pctMode && svc.total > 0) return Math.round((count / svc.total) * 100);
        return count;
      }),
      highlightScope: { highlight: "series" as const, fade: "global" as const },
      valueFormatter: (v: number | null) =>
        v === null ? "" : pctMode ? `${v}%` : `${v}`,
    }));
  }, [filteredInquiries, orderedServices, STATUSES, stacked, pctMode]);

  const xLabels = orderedServices.map((s) => s.label);

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  const isEmpty = filteredInquiries.length === 0;

  const tooltipSx = {
    "& .MuiChartsTooltip-paper": {
      backgroundColor: isDark ? "#3A3A3C !important" : "#ffffff !important",
      border: isDark ? "1px solid #48484A !important" : "1px solid #e5e7eb !important",
      color: isDark ? "#f3f4f6 !important" : "#111827 !important",
      borderRadius: "10px !important",
      boxShadow: "0 8px 24px rgb(0 0 0 / 0.25) !important",
    },
    "& .MuiChartsTooltip-mark": { borderRadius: "2px !important" },
    "& .MuiChartsTooltip-labelCell": {
      color: isDark ? "#aeaeb2 !important" : "#374151 !important",
    },
    "& .MuiChartsTooltip-valueCell": {
      color: isDark ? "#f9fafb !important" : "#111827 !important",
      fontWeight: "600 !important",
    },
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-2 p-6 shadow-sm">
      {/* ── Header ── */}
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
              Inquiries by Service &amp; Status
              <Tooltip title="Service Distribution" description="Displays how inquiries are distributed across different services and their current pipeline status." placement="top start" delay={0}>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-gray-300 hover:text-violet-500 transition-colors" />
                </TooltipTrigger>
              </Tooltip>
            </h3>
            <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
              {stacked ? "Stacked" : "Grouped"} bar view{pctMode ? " · % of service total" : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggles */}
          <TogglePill
            active={stacked}
            onClick={() => setStacked((v) => !v)}
            icon={LayoutList}
            label="Stacked"
          />
          <TogglePill
            active={pctMode}
            onClick={() => setPctMode((v) => !v)}
            icon={Percent}
            label="% Mode"
          />
          <TogglePill
            active={sortDesc}
            onClick={() => setSortDesc((v) => !v)}
            icon={ArrowDownUp}
            label="Sort"
          />

          {/* Range dropdown */}
          {!hideRangeControl && (
            <Dropdown
              options={RANGE_OPTIONS}
              value={months}
              onChange={setMonths}
            />
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      <div className="mb-4 flex flex-wrap gap-4">
        {STATUSES.map(({ key, label, color }) => (
          <div key={key} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>

      {isEmpty ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No data available for the selected period
          </p>
        </div>
      ) : (
        <div style={{ width: "100%", height: 380 }}>
          <BarChart
            height={380}
            series={series}
            xAxis={[{
              data: xLabels,
              scaleType: "band",
              tickLabelStyle: { fontSize: 11, fill: axisTickColor },
            }]}
            yAxis={[{
              width: 44,
              tickLabelStyle: { fontSize: 11, fill: axisTickColor },
              valueFormatter: (v: number) => pctMode ? `${v}%` : `${v}`,
            }]}
            margin={{ left: 10, right: 10, top: 10, bottom: 32 }}
            hideLegend
            slotProps={{ tooltip: { sx: tooltipSx } }}
            sx={{
              "& .MuiChartsAxis-tickLabel": { fontSize: "11px", fill: `${axisTickColor} !important` },
              "& .MuiChartsAxis-line": { stroke: axisLineColor },
              "& .MuiChartsAxis-tick": { stroke: axisLineColor },
              "& .MuiChartsGrid-line": { stroke: axisLineColor, opacity: 0.5 },
            }}
          />
        </div>
      )}
    </div>
  );
}
