"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { useTheme } from "next-themes";
import flatpickr from "flatpickr";
import type { Instance } from "flatpickr/dist/types/instance";
import "flatpickr/dist/flatpickr.min.css";
import { subMonths, format, startOfMonth, endOfMonth, differenceInMonths } from "date-fns";
import { Calendar, ChevronDown, Filter, AreaChart, Percent, Check, Info } from "lucide-react";
import { Tooltip, TooltipTrigger } from "@/admin/components/base/tooltip/tooltip";
import type { CrmLead } from "@/admin/types/crm";

// ─── Options ─────────────────────────────────────────────────────────────────

const GROUP_OPTIONS = [
  { label: "Segment: By Stage", value: "stage_name" },
  { label: "Segment: By Source", value: "source" },
  { label: "Segment: By Counselor", value: "assigned_to" },
  { label: "Total lead", value: "Total lead" },
  { label: "counsellor Contacted", value: "counsellor Contacted" },
  { label: "DNP (Did Not Respond)", value: "DNP (Did Not Respond)" },
  { label: "Shortlisting", value: "Shortlisting" },
  { label: "Documentation Collected", value: "Documentation Collected" },
  { label: "Applied to University", value: "Applied to University" },
  { label: "Offer Letter Received", value: "Offer Letter Received" },
  { label: "Ready to Pay", value: "Ready to Pay" },
  { label: "Deposit", value: "Deposit" },
  { label: "Education Loan", value: "Education Loan" },
  { label: "Accommodation", value: "Accommodation" },
  { label: "Visa Applied", value: "Visa Applied" },
  { label: "Visa Granted", value: "Visa Granted" },
  { label: "Enrollment", value: "Enrollment" },
  { label: "Closed / Lost", value: "Closed / Lost" },
];

const STAGE_COLORS: Record<string, string> = {
  "Total lead": "#6366f1",
  "counsellor Contacted": "#3b82f6",
  "DNP (Did Not Respond)": "#f97316",
  "Shortlisting": "#6366f1",
  "Documentation Collected": "#8b5cf6",
  "Applied to University": "#06b6d4",
  "Offer Letter Received": "#10b981",
  "Ready to Pay": "#6366f1",
  "Deposit": "#6366f1",
  "Education Loan": "#9333ea",
  "Accommodation": "#0ea5e9",
  "Visa Applied": "#eab308",
  "Visa Granted": "#22c55e",
  "Enrollment": "#14b8a6",
  "Closed / Lost": "#ef4444",
};

// Distinct palette for multi-line rendering (fallback)
const PALETTE = [
  "#8E94F2", // softPeriwinkle
  "#BBADFF", // mauve
  "#8895B3", // lavenderGrey
  "#9FA0FF", // wisteriaBlue
  "#595C96", // darksoftPeriwinkle
  "#846DF7", // darkmauve
  "#403165", // deepPurple
  "#7C5CBF", // amethyst
  "#0ea5e9", // fallback blue
  "#14b8a6", // fallback teal
];

// ─── Aggregation builders ─────────────────────────────────────────────────────
type GroupKey = "stage_name" | string;

function buildMonthlyData(
  leads: CrmLead[],
  months: number,
  groupKeys: GroupKey[],
  pctMode: boolean,
  customEnd?: Date
) {
  const now = customEnd || new Date();
  const buckets = Array.from({ length: months }, (_, i) => {
    const d = subMonths(now, months - 1 - i);
    return {
      label: format(d, "MMM yy"),
      start: startOfMonth(d),
      end: endOfMonth(d),
      counts: {} as Record<string, number>,
      total: 0,
    };
  });

  const uniqueTopics = new Set<string>();

  // Pre-populate uniqueTopics based on selected segmentations
  if (groupKeys.includes("stage_name")) {
    GROUP_OPTIONS.forEach((opt) => {
      if (opt.value !== "stage_name" && opt.value !== "source" && opt.value !== "assigned_to") {
        uniqueTopics.add(opt.label);
      }
    });
  }
  if (groupKeys.includes("source")) {
    leads.forEach(l => uniqueTopics.add(l.source || "Organic"));
  }
  if (groupKeys.includes("assigned_to")) {
    leads.forEach(l => uniqueTopics.add(l.assignee?.full_name || "Unassigned"));
  }

  // Add specifically selected individual stages
  groupKeys.forEach((k) => {
    if (k !== "stage_name" && k !== "source" && k !== "assigned_to") {
      uniqueTopics.add(k);
    }
  });

  leads.forEach((inq) => {
    const d = new Date(inq.created_at);
    const bucket = buckets.find((b) => d >= b.start && d <= b.end);
    if (!bucket) return;

    // Global total for this month (the denominator for true %)
    bucket.total++;

    groupKeys.forEach((k) => {
      if (k === "stage_name") {
        const topic = inq.stage?.name || "No Stage";
        bucket.counts[topic] = (bucket.counts[topic] || 0) + 1;
        uniqueTopics.add(topic);
      } else if (k === "source") {
        const topic = inq.source || "Organic";
        bucket.counts[topic] = (bucket.counts[topic] || 0) + 1;
        uniqueTopics.add(topic);
      } else if (k === "assigned_to") {
        const topic = inq.assignee?.full_name || "Unassigned";
        bucket.counts[topic] = (bucket.counts[topic] || 0) + 1;
        uniqueTopics.add(topic);
      } else if (inq.stage?.name === k) {
        bucket.counts[k] = (bucket.counts[k] || 0) + 1;
        uniqueTopics.add(k);
      }
    });
  });

  const seriesKeys = Array.from(uniqueTopics).sort();

  const dataset = buckets.map((b) => {
    const row: Record<string, string | number> = { month: b.label };
    // Use the global bucket total for percentage denominator, fallback to 1 to avoid div by zero
    const globalTotal = b.total;

    seriesKeys.forEach((t) => {
      const raw = b.counts[t] || 0;
      row[t] = pctMode
        ? (globalTotal > 0 ? Math.round((raw / globalTotal) * 100) : 0)
        : raw;
      row[t + "_raw"] = raw;
    });
    row.total = globalTotal;
    return row;
  });

  // Calculate peak based on the SUM of selected stages in a month (Raw counts)
  let peak = 0;
  let peakMonthIdx = -1;

  dataset.forEach((row, i) => {
    const monthRawSum = seriesKeys.reduce((acc, k) => {
      return acc + ((row[k + "_raw"] as number) || 0);
    }, 0);

    if (monthRawSum > peak) {
      peak = monthRawSum;
      peakMonthIdx = i;
    }
  });

  // If in percentage mode, we might want to show the peak as a volume anyway or adjust
  // But for the KPI, we'll keep the highest RAW sum found in any month.

  return { dataset, labels: buckets.map((b) => b.label), seriesKeys, total: leads.length, peak, peakMonthIdx };
}



// ─── Reusable Dropdown ────────────────────────────────────────────────────────


// ─── MultiDropdown ────────────────────────────────────────────────────────────
function MultiDropdown<T extends string | number>({
  options,
  values,
  onChange,
  icon: Icon,
}: {
  options: { label: string; value: T }[];
  values: T[];
  onChange: (v: T[]) => void;
  icon?: React.ElementType;
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

  const toggleVal = (v: T) => {
    if (v === "stage_name") {
      onChange(["stage_name" as T]);
      return;
    }
    const filtered = values.filter((x) => x !== "stage_name" && x !== v);
    if (!values.includes(v)) {
      filtered.push(v);
    }
    if (filtered.length === 0) {
      onChange(["stage_name" as T]);
    } else {
      onChange(filtered);
    }
  };

  const label =
    values.length === 1
      ? options.find((o) => o.value === values[0])?.label
      : values.includes("stage_name" as T)
        ? options.find((o) => o.value === "stage_name")?.label
        : `${values.length} Selected`;

  return (
    <div ref={ref} className="relative">
      <Tooltip title="Filter Stages" description="Select one or more specific stages to plot on the chart." delay={300}>
        <TooltipTrigger>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition h  :border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-300 dark:hover:border-violet-500"
          >
            {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
            {label}
            <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </TooltipTrigger>
      </Tooltip>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-dark-5 dark:bg-dark-2">
          {options.map((opt) => {
            const isSelected = values.includes(opt.value);
            return (
              <button
                key={String(opt.value)}
                onClick={() => toggleVal(opt.value)}
                className={`w-full flex items-center justify-between px-4 py-2 text-left text-xs transition ${isSelected
                  ? "bg-violet-50 font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                  : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-dark-4"
                  }`}
              >
                <span>{opt.label}</span>
                {isSelected && <Check className="h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── SingleDropdown ────────────────────────────────────────────────────────────
function SingleDropdown<T extends string | number>({
  options,
  value,
  onChange,
  icon: Icon,
  placeholder,
}: {
  options: { label: string; value: T }[];
  value: T | null;
  onChange: (v: T) => void;
  icon?: React.ElementType;
  placeholder?: string;
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

  const selectedLabel = options.find((o) => o.value === value)?.label || placeholder;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition hover:border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-300 dark:hover:border-violet-500 ${value ? "border-violet-200 bg-violet-50/30 text-violet-600" : ""}`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 opacity-70" />}
        {selectedLabel}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1.5 w-32 overflow-hidden rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-dark-5 dark:bg-dark-2">
          {options.map((opt) => (
            <button
              key={String(opt.value)}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full px-4 py-2 text-left text-xs transition ${value === opt.value
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

function ToggleIconBtn({
  active, onClick, icon: Icon, label, tooltipDesc,
}: { active: boolean; onClick: () => void; icon: React.ElementType; label: string; tooltipDesc?: string; }) {
  return (
    <Tooltip title={label} description={tooltipDesc} delay={300}>
      <TooltipTrigger
        onClick={onClick}
        className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${active
          ? "bg-violet-600 text-white shadow"
          : "border border-gray-200 bg-white text-gray-600 hover:border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-400 dark:hover:border-violet-500"
          }`}
      >
        <Icon className="h-3 w-3" />
        <span className="hidden sm:inline">{label}</span>
      </TooltipTrigger>
    </Tooltip>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export interface StudentLineChartProps {
  leads: CrmLead[];
  loading: boolean;
}

export function StudentLineChart({
  leads,
  loading,
}: StudentLineChartProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: subMonths(new Date(), 6),
    end: new Date(),
  });
  const [activePreset, setActivePreset] = useState<number | "all" | "ytd" | string | null>(6);
  const datePickerRef = useRef<HTMLInputElement>(null);
  const fpInstance = useRef<Instance | null>(null);

  useEffect(() => {
    if (!loading && datePickerRef.current) {
      fpInstance.current = flatpickr(datePickerRef.current, {
        mode: "range",
        static: false,
        monthSelectorType: "static",
        position: "auto right",
        defaultDate: [dateRange.start, dateRange.end],
        dateFormat: "M j, Y",
        onChange: (selectedDates) => {
          if (selectedDates.length === 2) {
            setDateRange({ start: selectedDates[0], end: selectedDates[1] });
            setActivePreset(null); // Clear preset highlight on custom selection
          }
        },
      });
      return () => {
        fpInstance.current?.destroy();
        fpInstance.current = null;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(new Date().getFullYear());
    leads.forEach(l => years.add(new Date(l.created_at).getFullYear()));
    return Array.from(years).sort((a, b) => b - a);
  }, [leads]);

  const applyPreset = (months: number | "all" | "ytd" | string) => {
    let start = new Date();
    let end = new Date();

    if (months === "all") {
      if (leads.length === 0) {
        start = subMonths(end, 12);
      } else {
        const times = leads.map((l) => new Date(l.created_at).getTime());
        start = new Date(Math.min(...times));
        end = new Date();
        end.setHours(23, 59, 59, 999);
      }
    } else if (months === "ytd") {
      start = new Date(new Date().getFullYear(), 0, 1);
    } else if (typeof months === "string" && months.startsWith("year-")) {
      const yr = parseInt(months.replace("year-", ""), 10);
      start = new Date(yr, 0, 1);
      end = new Date(yr, 11, 31, 23, 59, 59, 999);
    } else if (typeof months === "number") {
      // Align to the start of the month to show exactly N calendar months
      start = startOfMonth(subMonths(end, months - 1));
    }

    setDateRange({ start, end });
    setActivePreset(months);
    fpInstance.current?.setDate([start, end], false);
  };

  const [groupKeys, setGroupKeys] = useState<GroupKey[]>(["stage_name"]);
  const [hiddenSeries, setHiddenSeries] = useState<Record<string, boolean>>({});
  const [areaMode, setAreaMode] = useState(true);
  const [pctMode, setPctMode] = useState(false);

  const axisTickColor = isDark ? "#8E8E93" : "#6b7280";
  const axisLineColor = isDark ? "#48484A" : "#e5e7eb";

  const { dataset, seriesKeys, peakMonthIdx } = useMemo(() => {
    const filtered = leads.filter((i) => {
      const d = new Date(i.created_at);
      return d >= startOfMonth(dateRange.start) && d <= endOfMonth(dateRange.end);
    });

    const startBoundary = startOfMonth(dateRange.start);
    const endBoundary = startOfMonth(dateRange.end);
    const targetMonths = Math.max(1, differenceInMonths(endBoundary, startBoundary) + 1);

    return buildMonthlyData(filtered, targetMonths, groupKeys, pctMode, dateRange.end);
  }, [leads, dateRange, groupKeys, pctMode]);



  const toggleSeries = (key: string) =>
    setHiddenSeries((prev) => ({ ...prev, [key]: !prev[key] }));

  const series = seriesKeys
    .map((key: string, idx: number) => ({
      dataKey: key,
      label: key,
      color: STAGE_COLORS[key] || PALETTE[idx % PALETTE.length],
      area: areaMode,
      showMark: true,
      curve: "monotoneX" as const,
      valueFormatter: (v: number | null, context: { dataIndex: number }) => {
        if (v === null) return "";
        const raw = dataset[context.dataIndex]?.[key + "_raw"] ?? 0;
        return pctMode ? `${v}% (${raw} leads)` : `${v} leads`;
      },
    }))
    .filter((s: { dataKey: string }) => !hiddenSeries[s.dataKey]);

  const isEmpty = leads.length === 0;

  // Calculate selection-based stats
  const { seriesTotals, selectionTotalSum } = useMemo(() => {
    const totals: Record<string, number> = {};
    let selectionSum = 0;

    dataset.forEach((row: Record<string, string | number>) => {
      let monthlySelectedSum = 0;
      seriesKeys.forEach((k: string) => {
        const raw = (row[k + "_raw"] as number) || 0;
        totals[k] = (totals[k] || 0) + raw;
        monthlySelectedSum += raw;
      });
      selectionSum += monthlySelectedSum;
    });

    return {
      seriesTotals: totals,
      selectionTotalSum: selectionSum,
    };
  }, [dataset, seriesKeys]);

  const conversionData = useMemo(() => {
    if (groupKeys.length < 2 || groupKeys.includes("stage_name")) return null;

    // Find the base stage (the one appearing earliest in the funnel/GROUP_OPTIONS)
    const sortedSelected = [...groupKeys].sort((a, b) => {
      const idxA = GROUP_OPTIONS.findIndex(o => o.value === a);
      const idxB = GROUP_OPTIONS.findIndex(o => o.value === b);
      return idxA - idxB;
    });

    const baseStage = sortedSelected[0];
    const baseCount = seriesTotals[baseStage] || 0;
    const targetCount = selectionTotalSum - baseCount;

    const rate = baseCount > 0 ? ((targetCount / baseCount) * 100).toFixed(1) : "0";
    return { rate, baseStage, targetCount, baseCount };
  }, [groupKeys, seriesTotals, selectionTotalSum]);

  const selectionShare = leads.length > 0 ? ((selectionTotalSum / leads.length) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white dark:bg-dark-2 p-6 shadow-sm">
      {/* ── Header ── */}
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
            Trend Analysis
            <Tooltip title="Monthly Trends" description="Shows lead volume changes over time, grouped by your selection (all stages or specific ones)." placement="top start" delay={0}>
              <TooltipTrigger>
                <Info className="h-3.5 w-3.5 text-gray-300 hover:text-violet-500 transition-colors" />
              </TooltipTrigger>
            </Tooltip>
          </h3>
          <p className="mt-1 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
            <span>Monthly view</span>
            <span className="opacity-30">•</span>
            <span className="font-medium text-gray-500">{pctMode ? "Percentage" : "Raw counts"}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ToggleIconBtn
            active={areaMode}
            onClick={() => setAreaMode(!areaMode)}
            icon={AreaChart}
            label="Area"
            tooltipDesc="Fill the area under the line to visualize overall volume."
          />
          <ToggleIconBtn
            active={pctMode}
            onClick={() => setPctMode(!pctMode)}
            icon={Percent}
            label="% %"
            tooltipDesc="View each data point as a percentage of the total for that month."
          />

          <div className="h-8 w-px bg-gray-200 dark:bg-dark-5 mx-1 hidden sm:block" />

          <MultiDropdown
            options={GROUP_OPTIONS}
            values={groupKeys}
            onChange={(v) => {
              setGroupKeys(v as GroupKey[]);
              setHiddenSeries({});
            }}
            icon={Filter}
          />

          <div className="flex items-center gap-1 rounded-lg bg-gray-100/50 p-1 dark:bg-dark-4">
            {[
              { label: "3M", val: 3 },
              { label: "6M", val: 6 },
              { label: "YTD", val: "ytd" as const },
              { label: "All", val: "all" as const },
            ].map((p) => {
              const isSelected = activePreset === p.val;

              return (
                <Tooltip key={p.label} title={`${p.label} Range`} description={p.val === "all" ? "View all available data across all time." : `View data for the last ${p.label}.`} delay={300}>
                  <TooltipTrigger
                    onClick={() => applyPreset(p.val)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold transition-all ${isSelected
                      ? "bg-white text-violet-600 shadow-sm dark:bg-dark-3 dark:text-violet-400"
                      : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      }`}
                  >
                    {p.label}
                  </TooltipTrigger>
                </Tooltip>
              );
            })}
          </div>

          <div className="relative">
            <input
              ref={datePickerRef}
              className="h-9 w-55 rounded-lg border border-gray-200 bg-white px-3 pl-8 text-xs font-medium text-gray-700 outline-none transition focus:border-violet-300 dark:border-dark-5 dark:bg-dark-3 dark:text-gray-300 dark:focus:border-violet-500 shadow-sm"
              placeholder="Select Range"
            />
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          </div>

          <div className="h-8 w-px bg-gray-200 dark:bg-dark-5 mx-1 hidden sm:block" />

          <SingleDropdown
            options={availableYears.map((y: number) => ({ label: String(y), value: `year-${y}` }))}
            value={typeof activePreset === "string" && activePreset.startsWith("year-") ? activePreset : null}
            onChange={(v) => applyPreset(v)}
            placeholder="Year"
          />
        </div>
      </div>

      {/* ── Stats & Legend Bar ── */}
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Left Side: Functional Legend Pills */}
        <div className="flex flex-1 flex-wrap items-center gap-2 pr-4">
          {seriesKeys.map((key: string, idx: number) => {
            const isHidden = hiddenSeries[key] ?? false;
            const color = STAGE_COLORS[key] || PALETTE[idx % PALETTE.length];
            return (
              <Tooltip key={key} title={key} description={isHidden ? "Click to show" : "Click to hide"} delay={300}>
                <TooltipTrigger>
                  <button
                    onClick={() => toggleSeries(key)}
                    className={`flex items-center gap-3 rounded-2xl border px-6 py-4 text-sm font-bold transition-all ${isHidden
                      ? "border-gray-100 bg-gray-50 text-gray-400 dark:border-dark-5 dark:bg-dark-4 dark:text-gray-500"
                      : "border-violet-100 bg-white shadow-lg hover:bg-violet-50/50 dark:border-violet-500/20 dark:bg-dark-3 dark:text-gray-200"
                      }`}
                    style={!isHidden ? {
                      color,
                      borderColor: `${color}40`,
                      backgroundColor: isDark ? `${color}15` : "white"
                    } : undefined}
                  >
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: isHidden ? "transparent" : color }} />
                    {key}
                    <span className="opacity-40 font-black text-xs">({seriesTotals[key] || 0})</span>
                  </button>
                </TooltipTrigger>
              </Tooltip>
            );
          })}
        </div>

        {/* Right Side: Mixed KPI Grid */}
        <div className="flex flex-wrap items-center gap-3 sm:justify-end shrink-0">
          {/* KPI Pill: Total Selected (Brand Periwinkle) */}
          <div className="flex items-center gap-2 rounded-lg border border-brand-softPeriwinkle/20 bg-white px-3 py-1.5 shadow-sm dark:bg-dark-3">
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-softPeriwinkle">Selected</span>
              <Tooltip title="Total Selected" description={`Formula: Sum of all leads in your selection.`} placement="top start" delay={0}>
                <TooltipTrigger><Info className="h-3 w-3 text-brand-softPeriwinkle opacity-60" /></TooltipTrigger>
              </Tooltip>
            </div>
            <span className="text-xs font-black text-brand-darksoftPeriwinkle dark:text-brand-softPeriwinkle">{selectionTotalSum}</span>
            <div className="flex items-center gap-0.5 rounded bg-brand-softPeriwinkle/10 px-1 py-0.5 text-[8px] font-bold text-brand-darksoftPeriwinkle dark:text-brand-softPeriwinkle">
              {selectionShare}%
            </div>
          </div>

          {/* KPI Pill: Peak Month (Brand Mauve) */}
          {peakMonthIdx >= 0 && dataset[peakMonthIdx] && (
            <div className="flex items-center gap-2 rounded-lg border border-brand-mauve/20 bg-white px-3 py-1.5 shadow-sm dark:bg-dark-3">
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-mauve">Peak</span>
                <Tooltip title="Peak Month" description="Formula: Month with highest combined lead count." placement="top start" delay={0}>
                  <TooltipTrigger><Info className="h-3 w-3 text-brand-mauve opacity-60" /></TooltipTrigger>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-0.5 text-xs font-black text-brand-darkmauve dark:text-brand-mauve">
                <span>{String(dataset[peakMonthIdx].month).split(" ")[0]}</span>
                <span className="text-[9px] opacity-60">&apos;{String(dataset[peakMonthIdx].month).split(" ")[1]}</span>
              </div>
            </div>
          )}

          {/* KPI Card: Conversion (Brand Wisteria Blue - Large) */}
          {conversionData && (
            <div className="flex w-36 flex-col gap-0.5 rounded-xl bg-brand-wisteriaBlue/10 p-2.5 transition-all border border-brand-wisteriaBlue/20 shadow-md dark:bg-dark-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-wisteriaBlue">Conversion</span>
                <Tooltip title="Conversion Rate" description={`Formula: (Target ÷ Base) × 100.`} placement="top start" delay={0}>
                  <TooltipTrigger><Info className="h-3.5 w-3.5 text-brand-wisteriaBlue opacity-60" /></TooltipTrigger>
                </Tooltip>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black tracking-tight text-brand-darksoftPeriwinkle dark:text-brand-wisteriaBlue">{conversionData.rate}%</span>
              </div>
              <span className="text-[9px] font-medium text-brand-wisteriaBlue opacity-80 leading-none">funnel efficiency</span>
            </div>
          )}
        </div>
      </div>


      {/* ── Chart ── */}
      {isEmpty || series.length === 0 ? (
        <div className="flex h-72 items-center justify-center">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            {isEmpty ? "No data available yet" : "All series hidden — click a badge below to show"}
          </p>
        </div>
      ) : (
        <div style={{ width: "100%", height: 500 }}>
          <LineChart
            height={500}
            dataset={dataset}
            series={series}
            xAxis={[{
              scaleType: "point",
              dataKey: "month",
              tickLabelStyle: { fontSize: 11, fill: axisTickColor },
            }]}
            yAxis={[{
              width: 46,
              label: pctMode ? "Share (%)" : "Lead Count",
              labelStyle: { fontSize: 10, fill: axisTickColor, fontWeight: 600 },
              tickLabelStyle: { fontSize: 11, fill: axisTickColor },
              valueFormatter: (v: number) => pctMode ? `${v}%` : `${Math.round(v)}`,
              tickMinStep: pctMode ? undefined : 1,
            }]}
            margin={{ left: 10, right: 24, top: 28, bottom: 32 }}
            hideLegend
            slotProps={{
              tooltip: {
                sx: {
                  "& .MuiChartsTooltip-paper": {
                    backgroundColor: isDark ? "#e5e7eb !important" : "#6b7280 !important",
                    border: isDark ? "1px solid #d1d5db !important" : "1px solid #4b5563 !important",
                    color: isDark ? "#111827 !important" : "#ffffff !important",
                    borderRadius: "10px !important",
                    boxShadow: "0 8px 24px rgb(0 0 0 / 0.25) !important",
                    zIndex: "2000 !important",
                  },
                  "& .MuiChartsTooltip-labelCell": {
                    color: isDark ? "#374151 !important" : "#e5e7eb !important",
                  },
                  "& .MuiChartsTooltip-valueCell": {
                    color: isDark ? "#111827 !important" : "#ffffff !important",
                    fontWeight: "700 !important",
                  },
                },
              },
            }}
            sx={{
              "& .MuiAreaElement-root": {
                fillOpacity: isDark ? 0.22 : 0.16,
              },
              "& .MuiLineElement-root": {
                strokeWidth: 2.5,
              },
              "& .MuiMarkElement-root": {
                strokeWidth: 1.5,
                r: 3.5,
              },
              "& .MuiChartsAxis-tickLabel": {
                fontSize: "11px",
                fill: `${axisTickColor} !important`,
              },
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
