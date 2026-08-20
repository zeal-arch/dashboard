"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleCategory, Category } from "@/lib/store/preferencesSlice";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { Check, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const CATEGORIES: { id: Category; label: string; emoji: string; description: string }[] = [
  { id: "technology", label: "Technology", emoji: "💻", description: "AI, gadgets, software, startups" },
  { id: "sports", label: "Sports", emoji: "⚽", description: "Football, cricket, tennis, NBA" },
  { id: "finance", label: "Finance", emoji: "📈", description: "Markets, crypto, economy, stocks" },
  { id: "entertainment", label: "Entertainment", emoji: "🎬", description: "Movies, music, TV shows, gaming" },
  { id: "health", label: "Health", emoji: "🏥", description: "Wellness, medicine, fitness, nutrition" },
  { id: "science", label: "Science", emoji: "🔬", description: "Space, research, discoveries, climate" },
];

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const { categories } = useAppSelector((s) => s.preferences);

  return (
    <>
      <Breadcrumb pageName="Preferences" />

      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Content Preferences</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Choose categories to personalise your feed. Changes apply instantly.
            </p>
          </div>
        </div>

        {/* Category selection */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-dark-3 dark:bg-gray-dark">
          <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            Select your interests ({categories.length} selected)
          </h3>

          <div className="grid gap-3 sm:grid-cols-2">
            {CATEGORIES.map((cat, i) => {
              const selected = categories.includes(cat.id);
              return (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => dispatch(toggleCategory(cat.id))}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary/5 dark:border-primary/60 dark:bg-primary/10"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 dark:border-dark-3 dark:hover:bg-dark-3/60"
                  )}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-semibold", selected ? "text-primary" : "text-gray-800 dark:text-white")}>
                      {cat.label}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{cat.description}</p>
                  </div>
                  <div className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    selected ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-600"
                  )}>
                    {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-xs text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20 dark:text-blue-400">
          Your preferences are saved automatically to your browser and will persist across sessions.
          Head to <strong>My Feed</strong> to see personalised content based on your selections.
        </div>
      </div>
    </>
  );
}
