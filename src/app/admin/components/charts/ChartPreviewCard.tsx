"use client";

import Link from "next/link";
import { ArrowRightIcon, PieChart } from "@/admin/assets/icons";
import { PieChart as MuiPieChart } from "@mui/x-charts/PieChart";

const CONTENT_SLICES = [
  { id: 0, value: 42, label: "News",    color: "#3b82f6" },
  { id: 1, value: 31, label: "Movies",  color: "#8b5cf6" },
  { id: 2, value: 27, label: "Social",  color: "#0ea5e9" },
];

const CATEGORY_SLICES = [
  { id: 0, value: 35, label: "Technology",    color: "#6366f1" },
  { id: 1, value: 20, label: "Entertainment", color: "#f59e0b" },
  { id: 2, value: 18, label: "Finance",       color: "#10b981" },
  { id: 3, value: 15, label: "Sports",        color: "#ef4444" },
  { id: 4, value: 12, label: "Health",        color: "#ec4899" },
];

function MiniDonut({ slices, label }: { slices: typeof CONTENT_SLICES; label: string }) {
  return (
    <div className="flex items-center gap-4">
      <MuiPieChart
        series={[{ data: slices, innerRadius: 28, outerRadius: 44, paddingAngle: 2, cx: 50, cy: 50 }]}
        width={100}
        height={100}

      />
      <div className="space-y-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">{label}</p>
        {slices.map((s) => (
          <div key={s.id} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[11px] text-gray-600 dark:text-gray-400">{s.label}</span>
            <span className="ml-auto text-[11px] font-medium text-gray-800 dark:text-gray-300">{s.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChartPreviewCard() {
  return (
    <div className="grid gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-gray-dark sm:grid-cols-2">
      <MiniDonut slices={CONTENT_SLICES} label="By Content Type" />
      <MiniDonut slices={CATEGORY_SLICES} label="By Category" />

      <div className="col-span-full flex justify-end">
        <Link
          href="/admin/chart"
          className="group flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-primary transition-all hover:bg-primary/10"
        >
          <PieChart className="h-3.5 w-3.5" />
          View Full Analytics
          <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
