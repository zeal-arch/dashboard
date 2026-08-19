"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { fetchContent, resetContent, reorderItems, ContentItem } from "@/lib/store/contentSlice";
import { setSearchQuery } from "@/lib/store/preferencesSlice";
import { ContentCard } from "@/components/ui/ContentCard";
import Breadcrumb from "@/components/ui/Breadcrumbs/Breadcrumb";
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
import { GripVertical, Search, Loader2, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ── Debounce hook ──────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ── Sortable card wrapper ──────────────────────────────────────────────────────
function SortableCard({ item }: { item: ContentItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="relative">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="absolute -left-1 top-2 z-10 hidden cursor-grab touch-none rounded p-1 text-gray-300 hover:text-gray-500 group-hover:flex dark:text-gray-600 dark:hover:text-gray-400 active:cursor-grabbing"
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
  const { items, loading, hasMore, page } = useAppSelector((s) => s.content);
  const { categories, searchQuery } = useAppSelector((s) => s.preferences);

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 400);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  // Initial load / re-fetch when search or categories change
  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
    dispatch(resetContent());
    dispatch(fetchContent({ categories, page: 0, search: debouncedSearch }));
  }, [debouncedSearch, categories.join(",")]); // eslint-disable-line

  // Infinite scroll observer
  useEffect(() => {
    if (loading) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          dispatch(fetchContent({ categories, page: page + 1, search: debouncedSearch }));
        }
      },
      { threshold: 0.1 }
    );
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, page]); // eslint-disable-line

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIdx = items.findIndex((i) => i.id === active.id);
        const newIdx = items.findIndex((i) => i.id === over.id);
        dispatch(reorderItems(arrayMove(items, oldIdx, newIdx)));
      }
    },
    [items, dispatch]
  );

  const handleRefresh = () => {
    dispatch(resetContent());
    dispatch(fetchContent({ categories, page: 0, search: debouncedSearch }));
  };

  return (
    <>
      <Breadcrumb pageName="My Feed" />

      {/* ── Toolbar ── */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search news, movies, posts…"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-dark-3 dark:bg-gray-dark dark:text-white"
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {(["technology", "sports", "finance", "entertainment", "health", "science"] as const).map((cat) => (
            <span
              key={cat}
              className={`cursor-pointer rounded-full px-3 py-1 text-xs font-medium capitalize transition-all ${
                categories.includes(cat)
                  ? "bg-primary text-white shadow-sm"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 dark:bg-dark-3 dark:text-gray-400"
              }`}
              onClick={() => {
                // Toggle via Redux
                dispatch({ type: "preferences/toggleCategory", payload: cat });
              }}
            >
              {cat}
            </span>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          className="ml-auto flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-gray-50 dark:border-dark-3 dark:text-gray-400 dark:hover:bg-dark-3"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* ── Grid ── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
          <AnimatePresence mode="popLayout">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
              {items.map((item) => (
                <SortableCard key={item.id} item={item} />
              ))}

              {/* Loading skeletons */}
              {loading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <motion.div key={`sk-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
                    <Skeleton className="h-44 w-full rounded-lg" />
                    <Skeleton className="h-3 w-1/3 rounded" />
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
        <div className="flex flex-col items-center justify-center rounded-xl bg-white py-20 dark:bg-gray-dark">
          <Search className="h-10 w-10 text-gray-200 dark:text-gray-700" />
          <p className="mt-3 text-sm font-medium text-gray-500">No content found</p>
          <p className="mt-1 text-xs text-gray-400">Try adjusting your search or categories</p>
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
