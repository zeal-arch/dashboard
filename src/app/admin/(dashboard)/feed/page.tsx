"use client";

import { useEffect, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchContent, resetContent, reorderItems, ContentItem, addRealtimeItem } from "@/lib/store/contentSlice";
import { toggleCategory, Category } from "@/lib/store/preferencesSlice";
import { ContentCard } from "@/components/ui/ContentCard";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

const ALL_CATEGORIES: Category[] = [
  "technology",
  "sports",
  "entertainment",
  "music",
  "science",
  "gaming",
  "food",
  "anime",
  "social",
  "health",
  "finance",
  "business",
  "general",
];

// ── Sortable card wrapper ──────────────────────────────────────────────────────
function SortableCard({ item }: { item: ContentItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative group">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute right-3 bottom-3 z-20 flex h-8 w-8 items-center justify-center cursor-grab touch-none rounded-full bg-white/80 text-gray-700 shadow-sm backdrop-blur transition hover:bg-white active:cursor-grabbing dark:bg-black/50 dark:text-gray-200 dark:hover:bg-black/70"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <ContentCard item={item} isDragging={isDragging} />
      </div>
    </div>
  );
}

// ── Main Feed Page ─────────────────────────────────────────────────────────────
export default function FeedPage() {
  const dispatch = useAppDispatch();
  const { items, recommendedItems, loading, hasMore, page } = useAppSelector((s) => s.content);
  const selectedCategories = useAppSelector((s) => s.preferences.categories);
  const favoriteCount = useAppSelector((s) => s.favorites?.items?.length || 0);
  const isPersonalized = favoriteCount > 0;
  const { t, i18n } = useTranslation();

  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // generalItems is now simply items, as recommendations are separated in Redux state
  const generalItems = items;

  // Stable string key — prevents multiple fetches when Redux returns a new array
  // reference with the same values (happens during persist rehydration)
  const categoriesKey = [...selectedCategories].sort().join(",");

  // Track previous isPersonalized value to only re-fetch on the 0↔1 transition
  // (i.e. when user adds their FIRST favorite or removes their LAST one).
  // This ensures recommendations are computed/cleared without re-fetching on every like.
  const prevPersonalizedRef = useRef(isPersonalized);

  // Initial load + re-fetch when categories/language change.
  useEffect(() => {
    dispatch(resetContent());
    dispatch(fetchContent({ categories: selectedCategories, page: 0, search: "", forceRefresh: true }));
    prevPersonalizedRef.current = isPersonalized;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoriesKey, i18n.language]);

  // Re-fetch ONLY when personalization state flips (0→1 or 1→0)
  // so recommendations are computed on the first favorite / cleared on the last unfavorite.
  useEffect(() => {
    if (prevPersonalizedRef.current === isPersonalized) return; // no flip, skip
    prevPersonalizedRef.current = isPersonalized;
    dispatch(resetContent());
    dispatch(fetchContent({ categories: selectedCategories, page: 0, search: "", forceRefresh: true }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPersonalized]);


  // Server-Sent Events (SSE) connection for real-time posts
  useEffect(() => {
    const eventSource = new EventSource("/api/realtime");

    eventSource.onmessage = (event) => {
      try {
        const item = JSON.parse(event.data);
        if (item.connected) {
          // eslint-disable-next-line no-console
          console.log("Real-time feed connected successfully");
          return;
        }

        // Only add real-time item if it matches the user's currently selected categories
        const matchesCategory =
          selectedCategories.length === 0 ||
          selectedCategories.includes(item.type as Category) ||
          (item.type === "news" && selectedCategories.includes(item.category as Category)) ||
          (selectedCategories.includes("entertainment") && item.type === "movie") ||
          (selectedCategories.includes("music") && item.type === "music") ||
          (selectedCategories.includes("social") && item.type === "forum") ||
          (selectedCategories.includes("sports") && item.type === "sports") ||
          (selectedCategories.includes("science") && item.type === "science");

        if (matchesCategory) {
          dispatch(addRealtimeItem(item));
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to parse real-time event:", err);
      }
    };

    eventSource.onerror = (err) => {
      // eslint-disable-next-line no-console
      console.error("EventSource connection error:", err);
    };

    return () => {
      eventSource.close();
    };
  }, [dispatch, categoriesKey, selectedCategories]);
  // Infinite scroll observer
  useEffect(() => {
    if (loading) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          dispatch(fetchContent({ categories: selectedCategories, page: page + 1, search: "" }));
        }
      },
      { threshold: 0.1 }
    );
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, page, selectedCategories, dispatch]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIdx = items.findIndex((i: ContentItem) => i.id === active.id);
        const newIdx = items.findIndex((i: ContentItem) => i.id === over.id);
        if (oldIdx !== -1 && newIdx !== -1) {
          dispatch(reorderItems(arrayMove(items, oldIdx, newIdx)));
        }
      }
    },
    [items, dispatch]
  );

  const handleRefresh = () => {
    dispatch(resetContent());
    dispatch(fetchContent({ categories: selectedCategories, page: 0, search: "", forceRefresh: true }));
  };

  return (
    <>
      {/* ── Toolbar ── */}
      <div className="mb-3 flex flex-wrap items-center gap-3">
        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => {
            const isSelected = selectedCategories.includes(cat);
            return (
              <button
                key={cat}
                type="button"
                className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${isSelected
                  ? "bg-primary text-white shadow-sm"
                  : "bg-white/60 text-gray-600 hover:bg-white hover:text-gray-900 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white border border-gray-200/60 dark:border-white/5"
                  }`}
                onClick={() => dispatch(toggleCategory(cat))}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <button
          onClick={handleRefresh}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-gray-200/80 bg-white/60 px-3.5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-white hover:text-gray-900 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:bg-white/10 dark:hover:text-white backdrop-blur"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {t("common.refresh")}
        </button>
      </div>

      {/* ── Recommendations Grid ── */}
      {recommendedItems.length > 0 && isPersonalized && (
        <div className="mb-10">
          <div className="mb-4 flex items-end gap-3">
            <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              {t("feed.recommendationsTitle")}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 items-start">
            {recommendedItems.map((item: ContentItem) => (
              <ContentCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      {/* ── General Feed Grid ── */}
      {(generalItems.length > 0 || loading) && (
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            {t("feed.title")}
          </h2>
        </div>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={generalItems.map((i: ContentItem) => i.id)} strategy={rectSortingStrategy}>
          <AnimatePresence mode="popLayout">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 items-start">
              {generalItems.map((item: ContentItem) => (
                <SortableCard key={item.id} item={item} />
              ))}

              {/* Loading skeletons */}
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <motion.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-2xl border border-gray-200/60 bg-white/60 p-4 backdrop-blur dark:border-white/5 dark:bg-gray-dark">
                    <Skeleton className="h-44 w-full rounded-xl" />
                    <Skeleton className="h-3.5 w-1/3 rounded" />
                    <Skeleton className="h-4 w-full rounded" />
                    <Skeleton className="h-4 w-3/4 rounded" />
                  </motion.div>
                ))}
            </div>
          </AnimatePresence>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      {!loading && items.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white/40 py-20 backdrop-blur-sm dark:bg-white/5">
          <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300">No content found</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Try selecting different categories above</p>
        </div>
      )}

      {/* No more content */}
      {!hasMore && items.length > 0 && !loading && (
        <p className="mt-8 text-center text-xs text-gray-400">You&apos;ve reached the end of your feed</p>
      )}

      {/* Infinite scroll sentinel */}
      <div ref={bottomRef} className="h-4" />

      {/* Bottom loader */}
      {loading && items.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </div>
      )}
    </>
  );
}
