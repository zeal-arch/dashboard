"use client";

import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { toggleCategory, setCategories, Category, recordInteraction } from "@/lib/store/preferencesSlice";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import {
  Check,
  Settings,
  Sparkles,
  Sliders,
  Layers,
  Trash2,
  CheckSquare,
  Square,
  Laptop,
  Trophy,
  TrendingUp,
  Film,
  Music,
  Gamepad2,
  Utensils,
  Tv,
  Microscope,
  Activity,
  MessageSquare,
  Briefcase,
  Newspaper,
  Info,
  LucideIcon
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useTranslation } from "react-i18next";

const ALL_CATEGORIES: { id: Category; label: string; icon: LucideIcon; description: string; tag: string }[] = [
  { id: "technology", label: "Technology", icon: Laptop, description: "AI, gadgets, software, startups", tag: "Tech" },
  { id: "sports", label: "Sports", icon: Trophy, description: "Football, cricket, tennis, NBA", tag: "Sports" },
  { id: "finance", label: "Finance", icon: TrendingUp, description: "Markets, crypto, economy, stocks", tag: "Business" },
  { id: "entertainment", label: "Entertainment", icon: Film, description: "Movies, TV shows, cinema", tag: "Movies" },
  { id: "music", label: "Music", icon: Music, description: "Tracks, albums, artists, genres", tag: "Audio" },
  { id: "gaming", label: "Gaming", icon: Gamepad2, description: "Esports, releases, reviews, consoles", tag: "Gaming" },
  { id: "food", label: "Food & Dining", icon: Utensils, description: "Recipes, restaurants, culinary", tag: "Lifestyle" },
  { id: "anime", label: "Anime & Manga", icon: Tv, description: "Series, releases, Japanese culture", tag: "Media" },
  { id: "science", label: "Science", icon: Microscope, description: "Space, research, discoveries", tag: "Research" },
  { id: "health", label: "Health & Wellness", icon: Activity, description: "Fitness, nutrition, medicine", tag: "Wellness" },
  { id: "social", label: "Community & Forums", icon: MessageSquare, description: "Reddit discussions, 4chan threads", tag: "Social" },
  { id: "business", label: "Business & Economy", icon: Briefcase, description: "Corporate news, industry trends", tag: "Markets" },
  { id: "general", label: "General News", icon: Newspaper, description: "World headlines and breaking news", tag: "News" },
];

export default function PreferencesPage() {
  const dispatch = useAppDispatch();
  const { categories, interestScores } = useAppSelector((s) => s.preferences);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<"interests" | "personalization" | "system">("interests");

  const handleSelectAll = () => {
    dispatch(setCategories(ALL_CATEGORIES.map((c) => c.id)));
  };

  const handleClearAll = () => {
    dispatch(setCategories([]));
  };

  const handleResetPersonalization = () => {
    Object.keys(interestScores || {}).forEach((key) => {
      dispatch(recordInteraction({ tag: key, weight: -(interestScores[key] || 0) }));
    });
  };

  const topInterests = Object.entries(interestScores || {})
    .filter(([, score]) => score > 0)
    .sort(([, a], [, b]) => b - a);

  return (
    <>
      <Breadcrumb pageName="Preferences" />

      <div className="mx-auto max-w-4xl space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Settings className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Content & System Preferences</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Customise your feed categories, AI recommendations, and application settings.
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-dark-2 border border-gray-200/60 dark:border-white/5">
            <button
              onClick={() => setActiveTab("interests")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "interests"
                  ? "bg-white text-primary shadow-sm dark:bg-gray-dark dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              )}
            >
              <Layers className="h-3.5 w-3.5" />
              Categories
            </button>
            <button
              onClick={() => setActiveTab("personalization")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "personalization"
                  ? "bg-white text-primary shadow-sm dark:bg-gray-dark dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              )}
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-500" />
              AI Algorithm
            </button>
            <button
              onClick={() => setActiveTab("system")}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer",
                activeTab === "system"
                  ? "bg-white text-primary shadow-sm dark:bg-gray-dark dark:text-white"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              )}
            >
              <Sliders className="h-3.5 w-3.5" />
              System
            </button>
          </div>
        </div>

        {/* Tab 1: Categories */}
        {activeTab === "interests" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70"
          >
            <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 dark:border-white/5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Select your content interests ({categories.length} of {ALL_CATEGORIES.length} selected)
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Content matching these categories will be prioritized in your personalized feed.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-primary" />
                  Select All
                </button>
                <button
                  onClick={handleClearAll}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10"
                >
                  <Square className="h-3.5 w-3.5 text-gray-400" />
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_CATEGORIES.map((cat, i) => {
                const selected = categories.includes(cat.id);
                const IconComponent = cat.icon;
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => dispatch(toggleCategory(cat.id))}
                    className={cn(
                      "group relative flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-all cursor-pointer",
                      selected
                        ? "border-primary/80 bg-primary/5 shadow-sm dark:border-primary/60 dark:bg-primary/10"
                        : "border-gray-200/80 hover:border-gray-300 hover:bg-gray-50/80 dark:border-dark-3 dark:hover:bg-dark-3/60"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-110",
                        selected ? "bg-primary text-white" : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                      )}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-sm font-semibold truncate", selected ? "text-primary" : "text-gray-900 dark:text-white")}>
                          {cat.label}
                        </p>
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-white/10 dark:text-gray-400">
                          {cat.tag}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{cat.description}</p>
                    </div>

                    <div
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                        selected ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-600"
                      )}
                    >
                      {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Tab 2: AI Personalization Engine */}
        {activeTab === "personalization" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/5">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    Implicit Interest Profile (TF-IDF Recommender)
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Our recommendation engine learns your implicit preferences based on items you like, search, or view.
                  </p>
                </div>

                {topInterests.length > 0 && (
                  <button
                    onClick={handleResetPersonalization}
                    className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Reset Model
                  </button>
                )}
              </div>

              {topInterests.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">No interaction data recorded yet</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 max-w-sm mx-auto">
                    As you favorite items or search for specific topics, your personalized score graph will build automatically.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Learned Interest Weights
                  </h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {topInterests.map(([tag, score]) => (
                      <div key={tag} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/60 p-3.5 dark:border-white/5 dark:bg-white/5">
                        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 capitalize">{tag}</span>
                        <span className="rounded-md bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                          +{score.toFixed(1)} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tab 3: System Settings */}
        {activeTab === "system" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-gray-200/80 bg-white/70 p-6 shadow-sm backdrop-blur-xl dark:border-dark-3 dark:bg-gray-dark/70 space-y-6"
          >
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Storage & State Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Manage cached Redux state and local storage persistence.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 dark:border-white/5">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">Redux State Persistence</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Redux Persist active on local storage</p>
                </div>
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-gray-100 p-4 dark:border-white/5">
                <div>
                  <p className="text-xs font-semibold text-gray-800 dark:text-white">Real-Time Event Stream (SSE)</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">Listens on /api/realtime every 15s</p>
                </div>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                  Connected
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Bottom Tip Box */}
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs text-blue-800 dark:border-blue-900/30 dark:bg-blue-950/30 dark:text-blue-300 backdrop-blur-md">
          <Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>
            <strong>Note:</strong> Your preference changes update instantly across the entire dashboard and are automatically persisted to your browser session.
          </span>
        </div>
      </div>
    </>
  );
}
