"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchTrending } from "@/lib/store/contentSlice";
import { ContentCard } from "@/components/ui/ContentCard";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const RANK_STYLES = [
  "bg-yellow-400 text-white",
  "bg-gray-300 text-gray-800",
  "bg-orange-400 text-white",
  "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-400",
  "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-400",
  "bg-gray-100 text-gray-500 dark:bg-dark-3 dark:text-gray-400",
];

export default function TrendingPage() {
  const dispatch = useAppDispatch();
  const { trending, loading } = useAppSelector((s) => s.content);

  useEffect(() => {
    dispatch(fetchTrending());
  }, [dispatch]);

  return (
    <>
      <Breadcrumb pageName="Trending" />

      {/* Header banner */}
      <div className="mb-6 flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary/80 to-primary px-6 py-4 text-white shadow">
        <TrendingUp className="h-6 w-6" />
        <div>
          <h2 className="text-base font-bold">What&apos;s Trending</h2>
          <p className="text-xs text-white/75">Top trending topics curated across all available APIs right now</p>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
          {trending.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
              className="relative"
            >
              {/* Rank badge */}
              <span className={`absolute -left-2 -top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow ${RANK_STYLES[idx] ?? RANK_STYLES[3]}`}>
                {idx + 1}
              </span>
              <ContentCard item={item} />
            </motion.div>
          ))}
        </div>
      )}
    </>
  );
}
