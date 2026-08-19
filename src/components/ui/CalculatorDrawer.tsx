"use client";
import React from "react";

import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { BodyScrollLock, useClickAway } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  FlagIN, FlagPK, FlagBD, FlagSG, FlagAU, FlagKR, FlagDE, FlagGB, FlagCN, FlagCA, FlagMY, FlagNG,
} from "@/components/icons/icons";
import type { IconProps } from "@/components/icons/icons";

export type CalcType =
  | "cgpa-to-gpa"
  | "cgpa-to-percentage"
  | "percentage-to-cgpa"
  | "sgpa-to-percentage"
  | "sgpa-to-cgpa"
  | "weighted-cgpa"
  | "gpa-scale";

export const CALC_LABELS: Record<CalcType, string> = {
  "cgpa-to-gpa": "CGPA to GPA",
  "cgpa-to-percentage": "CGPA to %",
  "percentage-to-cgpa": "% to CGPA",
  "sgpa-to-percentage": "SGPA to %",
  "sgpa-to-cgpa": "SGPA to CGPA",
  "weighted-cgpa": "Weighted CGPA",
  "gpa-scale": "GPA Scale",
};

export const CALC_TYPES = Object.keys(CALC_LABELS) as CalcType[];

// ─── Shared primitives ────────────────────────────────────────────────────────

function NumInput({
  placeholder,
  value,
  onChange,
  min,
  max,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}) {
  return (
    <input
      type="number"
      min={min}
      max={max}
      step={0.01}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
    />
  );
}

function ResultCard({
  result,
  unit,
  formula,
}: {
  result: string;
  unit: string;
  formula: string;
}) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 text-center">
      <p className="text-xs uppercase tracking-widest text-gray-400">Result</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">
        {result}{" "}
        <span className="text-base font-normal text-gray-500">{unit}</span>
      </p>
      <p className="mt-1 text-xs text-gray-400">{formula}</p>
    </div>
  );
}

function ConvertButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg bg-brand-softPeriwinkle px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-softPeriwinkle/90"
    >
      Convert
    </button>
  );
}

// ─── Country configs for CGPA → GPA ─────────────────────────────────────────

type CountryConfig = {
  Flag: React.FC<IconProps>;
  name: string;
  system: string;
  min: number;
  max: number;
  placeholder: string;
  convert: (v: number) => number;
  formula: string;
  /** Override the unit shown in results (default: "/ 4.0") */
  resultUnit?: string;
  /** When false, skip the Math.min(result, 4.0) cap (e.g. German scale) */
  capAt4?: boolean;
  /** Return a human-readable label for the numeric result */
  getNote?: (result: number) => string;
};

const COUNTRY_CONFIGS: CountryConfig[] = [
  {
    Flag: FlagIN,
    name: "India",
    system: "10-point CGPA",
    min: 0,
    max: 10,
    placeholder: "Enter CGPA (0 – 10)",
    convert: (v) => v * 0.4,
    formula: "GPA = CGPA × 0.4",
  },
  {
    Flag: FlagPK,
    name: "Pakistan",
    system: "4.0 GPA",
    min: 0,
    max: 4,
    placeholder: "Enter GPA (0 – 4.0)",
    convert: (v) => v,
    formula: "Already on 4.0 scale",
  },
  {
    Flag: FlagBD,
    name: "Bangladesh",
    system: "4.0 CGPA",
    min: 0,
    max: 4,
    placeholder: "Enter CGPA (0 – 4.0)",
    convert: (v) => v,
    formula: "Already on 4.0 scale",
  },
  {
    Flag: FlagSG,
    name: "Singapore",
    system: "5.0 CAP",
    min: 0,
    max: 5,
    placeholder: "Enter CAP (0 – 5.0)",
    convert: (v) => (v / 5.0) * 4.0,
    formula: "GPA = CAP ÷ 5.0 × 4.0",
  },
  {
    Flag: FlagAU,
    name: "Australia",
    system: "7-point GPA",
    min: 0,
    max: 7,
    placeholder: "Enter GPA (0 – 7.0)",
    convert: (v) => (v / 7.0) * 4.0,
    formula: "US GPA = GPA ÷ 7.0 × 4.0",
  },
  {
    Flag: FlagKR,
    name: "South Korea",
    system: "4.5 GPA",
    min: 0,
    max: 4.5,
    placeholder: "Enter GPA (0 – 4.5)",
    convert: (v) => (v / 4.5) * 4.0,
    formula: "US GPA = GPA ÷ 4.5 × 4.0",
  },
  {
    Flag: FlagDE,
    name: "Germany",
    system: "10-pt CGPA → German Grade (Modified Bavarian)",
    min: 0,
    max: 10,
    placeholder: "Enter your CGPA (0 – 10, Nmin = 4)",
    convert: (v) => 1 + (3 * (10 - v)) / (10 - 4),
    formula: "German Grade = 1 + 3 × (10 − CGPA) ÷ 6",
    resultUnit: "(1.0 – 5.0 scale)",
    capAt4: false,
    getNote: (v) =>
      v <= 1.5
        ? "Very Good (Sehr gut)"
        : v <= 2.5
          ? "Good (Gut)"
          : v <= 3.5
            ? "Satisfactory (Befriedigend)"
            : v <= 4.0
              ? "Pass (Ausreichend)"
              : "Fail (Nicht bestanden)",
  },
  {
    Flag: FlagGB,
    name: "UK",
    system: "Percentage",
    min: 0,
    max: 100,
    placeholder: "Enter Percentage (0 – 100)",
    convert: (v) => {
      if (v >= 70) return 4.0;
      if (v >= 60) return 3.3 + ((v - 60) / 10) * 0.4;
      if (v >= 50) return 3.0 + ((v - 50) / 10) * 0.3;
      if (v >= 40) return 2.7 + ((v - 40) / 10) * 0.3;
      return 0;
    },
    formula: "WES UK classification mapping",
  },
  {
    Flag: FlagCN,
    name: "China",
    system: "Percentage",
    min: 0,
    max: 100,
    placeholder: "Enter Percentage (0 – 100)",
    convert: (v) => {
      if (v >= 85) return 4.0;
      if (v >= 75) return 3.0 + (v - 75) / 10;
      if (v >= 60) return 2.0 + (v - 60) / 15;
      return 0;
    },
    formula: "Standard Chinese grading conversion",
  },
  {
    Flag: FlagCA,
    name: "Canada",
    system: "4.0 / 4.3 GPA",
    min: 0,
    max: 4.3,
    placeholder: "Enter GPA (0 – 4.3)",
    convert: (v) => Math.min(v, 4.0),
    formula: "US GPA = min(GPA, 4.0)",
  },
  {
    Flag: FlagMY,
    name: "Malaysia",
    system: "4.0 CGPA",
    min: 0,
    max: 4,
    placeholder: "Enter CGPA (0 – 4.0)",
    convert: (v) => v,
    formula: "Already on 4.0 scale",
  },
  {
    Flag: FlagNG,
    name: "Nigeria",
    system: "5.0 CGPA",
    min: 0,
    max: 5,
    placeholder: "Enter CGPA (0 – 5.0)",
    convert: (v) => (v / 5.0) * 4.0,
    formula: "GPA = CGPA ÷ 5.0 × 4.0",
  },
  {
    Flag: FlagDE,
    name: "Germany (% → Grade)",
    system: "Percentage → German Grade (Modified Bavarian)",
    min: 0,
    max: 100,
    placeholder: "Enter Percentage (0 – 100, Nmin = 40)",
    convert: (v) => 1 + (3 * (100 - v)) / (100 - 40),
    formula: "German Grade = 1 + 3 × (100 − %) ÷ 60",
    resultUnit: "(1.0 – 5.0 scale)",
    capAt4: false,
    getNote: (v) =>
      v <= 1.5
        ? "Very Good (Sehr gut)"
        : v <= 2.5
          ? "Good (Gut)"
          : v <= 3.5
            ? "Satisfactory (Befriedigend)"
            : v <= 4.0
              ? "Pass (Ausreichend)"
              : "Fail (Nicht bestanden)",
  },
];

// ─── Individual calculators ───────────────────────────────────────────────────

function CgpaToGpa() {
  const [cgpa, setCgpa] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [countryIdx, setCountryIdx] = useState(0);

  const country = COUNTRY_CONFIGS[countryIdx];

  function calculate() {
    const val = parseFloat(cgpa);
    if (!isNaN(val) && val >= country.min && val <= country.max) {
      const raw = country.convert(val);
      setResult(
        (country.capAt4 === false ? raw : Math.min(raw, 4.0)).toFixed(2),
      );
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {country.capAt4 === false
          ? `Convert your ${country.max === 100 ? "percentage" : "CGPA"} to the German grading scale using the Modified Bavarian Formula.`
          : "Select your country and convert to a US 4.0 GPA scale."}
      </p>

      {/* Country flag picker */}
      <div className="flex flex-wrap gap-1.5">
        {COUNTRY_CONFIGS.map((c, i) => (
          <button
            key={c.name}
            onClick={() => {
              setCountryIdx(i);
              setCgpa("");
              setResult(null);
            }}
            title={`${c.name} — ${c.system}`}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border p-1 transition-all overflow-hidden",
              countryIdx === i
                ? "border-brand-softPeriwinkle/40 bg-brand-mauve/20 shadow-sm"
                : "border-gray-200 bg-white hover:border-brand-softPeriwinkle/60",
            )}
          >
            <c.Flag width={28} height={18} className="rounded-sm object-cover" />
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        <span className="font-medium text-brand-darksoftPeriwinkle">
          {country.name}
        </span>
        {" · "}
        {country.system}
      </p>

      <div className="flex gap-3">
        <NumInput
          placeholder={country.placeholder}
          value={cgpa}
          onChange={(v) => {
            setCgpa(v);
            setResult(null);
          }}
          min={country.min}
          max={country.max}
        />
        <ConvertButton onClick={calculate} />
      </div>
      {result && (
        <>
          <ResultCard
            result={result}
            unit={country.resultUnit ?? "/ 4.0"}
            formula={`Formula: ${country.formula}`}
          />
          {country.getNote && (
            <p className="text-center text-xs font-medium text-brand-darksoftPeriwinkle">
              {country.getNote(parseFloat(result))}
            </p>
          )}
        </>
      )}
    </div>
  );
}

const CGPA_TO_PERCENTAGE_METHODS = [
  {
    key: "cbse",
    label: "CBSE",
    description: "CBSE / Most Indian universities",
    convert: (v: number) => v * 9.5,
    formula: "Percentage = CGPA × 9.5",
  },
  {
    key: "aicte",
    label: "AICTE",
    description: "AICTE / Engineering colleges",
    convert: (v: number) => (v - 0.5) * 10,
    formula: "Percentage = (CGPA − 0.5) × 10",
  },
  {
    key: "vtu",
    label: "VTU",
    description: "Visvesvaraya Technological University",
    convert: (v: number) => (v - 0.75) * 10,
    formula: "Percentage = (CGPA − 0.75) × 10",
  },
] as const;

type CgpaToPercentageMethodKey =
  (typeof CGPA_TO_PERCENTAGE_METHODS)[number]["key"];

function CgpaToPercentage() {
  const [cgpa, setCgpa] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [methodKey, setMethodKey] = useState<CgpaToPercentageMethodKey>("cbse");

  const method = CGPA_TO_PERCENTAGE_METHODS.find((m) => m.key === methodKey)!;

  function calculate() {
    const val = parseFloat(cgpa);
    if (!isNaN(val) && val >= 0 && val <= 10) {
      const pct = method.convert(val);
      setResult(Math.max(0, Math.min(100, pct)).toFixed(2));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Convert your 10-point CGPA to percentage using your university&apos;s
        method.
      </p>

      {/* Method tabs */}
      <div className="flex gap-2">
        {CGPA_TO_PERCENTAGE_METHODS.map((m) => (
          <button
            key={m.key}
            onClick={() => {
              setMethodKey(m.key);
              setResult(null);
            }}
            className={cn(
              "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
              methodKey === m.key
                ? "border-brand-softPeriwinkle bg-brand-softPeriwinkle text-white"
                : "border-gray-200 bg-white text-gray-600 hover:border-brand-softPeriwinkle/60",
            )}
          >
            {m.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-400">
        <span className="font-medium text-brand-darksoftPeriwinkle">
          {method.description}
        </span>
      </p>

      <div className="flex gap-3">
        <NumInput
          placeholder="Enter CGPA (0 – 10)"
          value={cgpa}
          onChange={(v) => {
            setCgpa(v);
            setResult(null);
          }}
          min={0}
          max={10}
        />
        <ConvertButton onClick={calculate} />
      </div>
      {result && (
        <ResultCard
          result={result}
          unit="%"
          formula={`Formula: ${method.formula}`}
        />
      )}
    </div>
  );
}

function PercentageToCgpa() {
  const [percentage, setPercentage] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const val = parseFloat(percentage);
    if (!isNaN(val) && val >= 0 && val <= 100) {
      setResult((val / 9.5).toFixed(2));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Convert your percentage to a 10-point CGPA.
      </p>
      <div className="flex gap-3">
        <NumInput
          placeholder="Enter Percentage (0 – 100)"
          value={percentage}
          onChange={(v) => {
            setPercentage(v);
            setResult(null);
          }}
          min={0}
          max={100}
        />
        <ConvertButton onClick={calculate} />
      </div>
      {result && (
        <ResultCard
          result={result}
          unit="/ 10"
          formula="Formula: CGPA = Percentage ÷ 9.5"
        />
      )}
    </div>
  );
}

function SgpaToPercentage() {
  const [sgpa, setSgpa] = useState("");
  const [result, setResult] = useState<string | null>(null);

  function calculate() {
    const val = parseFloat(sgpa);
    if (!isNaN(val) && val >= 0 && val <= 10) {
      setResult((val * 9.5).toFixed(2));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Convert your semester SGPA to a percentage.
      </p>
      <div className="flex gap-3">
        <NumInput
          placeholder="Enter SGPA (0 – 10)"
          value={sgpa}
          onChange={(v) => {
            setSgpa(v);
            setResult(null);
          }}
          min={0}
          max={10}
        />
        <ConvertButton onClick={calculate} />
      </div>
      {result && (
        <ResultCard
          result={result}
          unit="%"
          formula="Formula: Percentage = SGPA × 9.5"
        />
      )}
    </div>
  );
}

function SgpaToCgpa() {
  const [sgpas, setSgpas] = useState<string[]>(["", ""]);
  const [result, setResult] = useState<string | null>(null);

  function updateSgpa(index: number, value: string) {
    setSgpas((prev) => prev.map((v, i) => (i === index ? value : v)));
    setResult(null);
  }

  function addSemester() {
    setSgpas((prev) => [...prev, ""]);
  }

  function removeSemester(index: number) {
    if (sgpas.length <= 1) return;
    setSgpas((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  }

  function calculate() {
    const vals = sgpas
      .map((v) => parseFloat(v))
      .filter((v) => !isNaN(v) && v >= 0 && v <= 10);
    if (vals.length === 0) return;
    const avg = vals.reduce((sum, v) => sum + v, 0) / vals.length;
    setResult(avg.toFixed(2));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter SGPA for each semester to calculate your overall CGPA.
      </p>
      <div className="space-y-2">
        {sgpas.map((val, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-16 shrink-0 text-xs text-gray-400">
              Sem {i + 1}
            </span>
            <NumInput
              placeholder="SGPA (0 – 10)"
              value={val}
              onChange={(v) => updateSgpa(i, v)}
              min={0}
              max={10}
            />
            {sgpas.length > 1 && (
              <button
                onClick={() => removeSemester(i)}
                className="text-gray-300 transition-colors hover:text-gray-600"
                aria-label="Remove semester"
              >
                <X size={15} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={addSemester}
          className="text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-900"
        >
          + Add semester
        </button>
        <button
          onClick={calculate}
          className="ml-auto rounded-lg bg-brand-softPeriwinkle px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-softPeriwinkle/80"
        >
          Calculate
        </button>
      </div>
      {result && (
        <ResultCard
          result={result}
          unit="/ 10"
          formula="Formula: CGPA = Average of all SGPAs"
        />
      )}
    </div>
  );
}

// ─── Weighted CGPA ────────────────────────────────────────────────────────────

type Subject = { grade: string; credits: string };

function WeightedCgpa() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { grade: "", credits: "" },
    { grade: "", credits: "" },
    { grade: "", credits: "" },
  ]);
  const [result, setResult] = useState<string | null>(null);

  function updateSubject(i: number, field: keyof Subject, val: string) {
    setSubjects((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );
    setResult(null);
  }

  function addSubject() {
    setSubjects((prev) => [...prev, { grade: "", credits: "" }]);
  }

  function removeSubject(i: number) {
    if (subjects.length <= 1) return;
    setSubjects((prev) => prev.filter((_, idx) => idx !== i));
    setResult(null);
  }

  function calculate() {
    let totalPoints = 0;
    let totalCredits = 0;
    for (const s of subjects) {
      const g = parseFloat(s.grade);
      const c = parseFloat(s.credits);
      if (!isNaN(g) && !isNaN(c) && c > 0 && g >= 0 && g <= 10) {
        totalPoints += g * c;
        totalCredits += c;
      }
    }
    if (totalCredits === 0) return;
    setResult((totalPoints / totalCredits).toFixed(2));
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Enter grade points and credits for each subject to calculate your
        credit-weighted CGPA.
      </p>

      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-6 shrink-0" />
        <span className="flex-1 text-center text-xs font-medium text-gray-400">
          Grade (0–10)
        </span>
        <span className="flex-1 text-center text-xs font-medium text-gray-400">
          Credits
        </span>
        <span className="w-6 shrink-0" />
      </div>

      <div className="space-y-2">
        {subjects.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 shrink-0 text-center text-xs text-gray-400">
              {i + 1}
            </span>
            <input
              type="number"
              min={0}
              max={10}
              step={0.01}
              placeholder="e.g. 8.5"
              value={s.grade}
              onChange={(e) => updateSubject(i, "grade", e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <input
              type="number"
              min={0.5}
              step={0.5}
              placeholder="e.g. 4"
              value={s.credits}
              onChange={(e) => updateSubject(i, "credits", e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
            <button
              onClick={() => removeSubject(i)}
              className="w-6 shrink-0 text-gray-300 transition-colors hover:text-gray-600"
              aria-label="Remove subject"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={addSubject}
          className="text-sm text-gray-500 underline underline-offset-2 transition-colors hover:text-gray-900"
        >
          + Add subject
        </button>
        <button
          onClick={calculate}
          className="ml-auto rounded-lg bg-brand-softPeriwinkle px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-softPeriwinkle/80"
        >
          Calculate
        </button>
      </div>

      {result && (
        <ResultCard
          result={result}
          unit="/ 10"
          formula="Formula: CGPA = Σ(Grade × Credits) ÷ ΣCredits"
        />
      )}
    </div>
  );
}

// ─── Custom dropdown for GPA Scale Converter ────────────────────────────────

function ScaleSelect({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { label: string; value: number }[];
  value: number;
  onChange: (idx: number) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const selectedLabel = options[value]?.label ?? "";

  // Recalculate position when opening
  useEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        listRef.current?.contains(target)
      )
        return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  // Close on Escape or parent scroll (but not the dropdown's own scroll)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onScroll(e: Event) {
      if (listRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-gray-400">{label}</span>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors",
          open
            ? "border-brand-softPeriwinkle/50 ring-2 ring-brand-softPeriwinkle/20"
            : "border-gray-200 hover:border-brand-softPeriwinkle/40",
        )}
      >
        <span className="truncate text-gray-800">{selectedLabel}</span>
        <ChevronDown
          size={14}
          className={cn(
            "ml-2 shrink-0 text-gray-400 transition-transform duration-150",
            open && "rotate-180",
          )}
        />
      </button>
      {open &&
        createPortal(
          <ul
            ref={listRef}
            style={{
              position: "fixed",
              top: pos.top,
              left: pos.left,
              width: pos.width,
              zIndex: 9999,
            }}
            className="max-h-52 overflow-y-auto overscroll-contain rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
          >
            {options.map((opt, i) => (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(i);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-sm transition-colors",
                    value === i
                      ? "bg-brand-softPeriwinkle/10 font-medium text-brand-darksoftPeriwinkle"
                      : "text-gray-700 hover:bg-gray-50",
                  )}
                >
                  {opt.label}
                  {value === i && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-softPeriwinkle" />
                  )}
                </button>
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}

// ─── GPA Scale Converter ──────────────────────────────────────────────────────

const GPA_SCALES = [
  { label: "India (10.0)", value: 10 },
  { label: "USA (4.0)", value: 4 },
  { label: "Canada (4.3)", value: 4.3 },
  { label: "Singapore (5.0)", value: 5 },
  { label: "Australia (7.0)", value: 7 },
  { label: "South Korea (4.5)", value: 4.5 },
  { label: "Nigeria (5.0)", value: 5 },
];

function GpaScaleConverter() {
  const [gpa, setGpa] = useState("");
  const [fromIdx, setFromIdx] = useState(0);
  const [toIdx, setToIdx] = useState(1);
  const [result, setResult] = useState<string | null>(null);

  const from = GPA_SCALES[fromIdx];
  const to = GPA_SCALES[toIdx];

  function calculate() {
    const val = parseFloat(gpa);
    if (!isNaN(val) && val >= 0 && val <= from.value) {
      setResult(((val / from.value) * to.value).toFixed(2));
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Convert between any two GPA scales by proportional mapping.
      </p>

      {/* From / To scale selectors */}
      <div className="grid grid-cols-2 gap-3">
        <ScaleSelect
          label="From"
          options={GPA_SCALES}
          value={fromIdx}
          onChange={(i) => {
            setFromIdx(i);
            setGpa("");
            setResult(null);
          }}
        />
        <ScaleSelect
          label="To"
          options={GPA_SCALES}
          value={toIdx}
          onChange={(i) => {
            setToIdx(i);
            setResult(null);
          }}
        />
      </div>

      <div className="flex gap-3">
        <NumInput
          placeholder={`Enter GPA (0 – ${from.value})`}
          value={gpa}
          onChange={(v) => {
            setGpa(v);
            setResult(null);
          }}
          min={0}
          max={from.value}
        />
        <ConvertButton onClick={calculate} />
      </div>

      {result && (
        <ResultCard
          result={result}
          unit={`/ ${to.value}`}
          formula={`Formula: GPA = (Input ÷ ${from.value}) × ${to.value}`}
        />
      )}
    </div>
  );
}

const CALC_COMPONENTS: Record<CalcType, React.FC> = {
  "cgpa-to-gpa": CgpaToGpa,
  "cgpa-to-percentage": CgpaToPercentage,
  "percentage-to-cgpa": PercentageToCgpa,
  "sgpa-to-percentage": SgpaToPercentage,
  "sgpa-to-cgpa": SgpaToCgpa,
  "weighted-cgpa": WeightedCgpa,
  "gpa-scale": GpaScaleConverter,
};

// ─── Drawer ───────────────────────────────────────────────────────────────────

interface CalculatorDrawerProps {
  open: boolean;
  activeCalc: CalcType;
  onCalcChange: (type: CalcType) => void;
  onClose: () => void;
}

export function CalculatorDrawer({
  open,
  activeCalc,
  onCalcChange,
  onClose,
}: CalculatorDrawerProps) {
  const drawerRef = useClickAway<HTMLDivElement>(onClose);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const ActiveCalc = CALC_COMPONENTS[activeCalc];

  return (
    <AnimatePresence>
      {open && (
        <>
          <BodyScrollLock />
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/30"
          />

          {/* Sheet */}
          <motion.div
            ref={drawerRef}
            key="drawer"
            initial={{ opacity: 0, scale: 0.92, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -16 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="fixed left-1/2 top-1/2 z-50 flex w-[calc(100%-1.5rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col max-h-[85dvh] rounded-2xl bg-white shadow-2xl"
          >
            {/* Pinned header — always visible regardless of scroll */}
            <div className="flex-none px-6 pt-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">
                  Calculators
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Calc-type tab pills */}
              <div className="flex flex-wrap gap-2 pb-4">
                {CALC_TYPES.map((type) => (
                  <button
                    key={type}
                    onClick={() => onCalcChange(type)}
                    className={cn(
                      "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                      activeCalc === type
                        ? "border-brand-softPeriwinkle bg-brand-softPeriwinkle text-white"
                        : "border-gray-200 bg-white text-gray-600 hover:border-brand-softPeriwinkle/60",
                    )}
                  >
                    {CALC_LABELS[type]}
                  </button>
                ))}
              </div>
              <div className="h-px bg-gray-100" />
            </div>

            {/* Scrollable calculator body */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-6 pb-8 pt-5">
              <ActiveCalc />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
