"use client";

import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { clearFavorites } from "@/lib/store/favoritesSlice";
import { ContentCard } from "@/components/ui/ContentCard";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
import { Heart, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesPage() {
  const dispatch = useAppDispatch();
  const favoriteIds = useAppSelector((s) => s.favorites.ids);
  const allItems = useAppSelector((s) => s.content.items);
  const trendingItems = useAppSelector((s) => s.content.trending);

  // Build a unified map of all known items across both slices
  const allKnownItems = [...allItems, ...trendingItems];
  const uniqueMap = new Map(allKnownItems.map((i) => [i.id, i]));
  const favoriteItems = favoriteIds
    .map((id) => uniqueMap.get(id))
    .filter((i): i is NonNullable<typeof i> => Boolean(i));

  return (
    <>
      <Breadcrumb pageName="Favorites" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-400 text-red-400" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {favoriteItems.length} saved item{favoriteItems.length !== 1 ? "s" : ""}
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
            className="flex flex-col items-center justify-center rounded-xl bg-white py-24 dark:bg-gray-dark"
          >
            <Heart className="h-12 w-12 text-gray-200 dark:text-gray-700" />
            <p className="mt-3 text-sm font-medium text-gray-500">No favorites yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Tap the ❤ on any card in your feed to save it here
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
                transition={{ delay: idx * 0.05 }}
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
