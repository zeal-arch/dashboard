"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { clearFavorites } from "@/lib/store/favoritesSlice";
import { ContentCard } from "@/components/ui/ContentCard";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { Heart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favoriteItems = useAppSelector((s) => s.favorites?.items || []);
  const { t } = useTranslation();

  return (
    <>
      <Breadcrumb pageName={t("nav.favorites")} />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-400 text-red-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {favoriteItems.length} {t("nav.favorites").toLowerCase()}
          </h2>
        </div>
        {favoriteItems.length > 0 && (
          <button
            onClick={() => dispatch(clearFavorites())}
            className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </button>
        )}
      </div>

      <AnimatePresence mode="popLayout">
        {favoriteItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-2xl bg-white/40 py-24 backdrop-blur-sm dark:bg-white/5"
          >
            <Heart className="h-12 w-12 text-gray-300 dark:text-gray-600" />
            <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-300">{t("favorites.empty")}</p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {t("favorites.placeholder")}
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
            {favoriteItems.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.04 }}
              >
                <ContentCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
