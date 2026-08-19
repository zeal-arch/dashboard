"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ContentCard } from "@/components/ui/ContentCard";
import { Search, Film, Tv, Compass, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import type { ContentItem } from "@/lib/store/contentSlice";
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setSearchQuery } from "@/lib/store/preferencesSlice";

// ── Isolated search state — does NOT touch the shared feed Redux slice ─────────
// Fetches from all same APIs but filters locally by search query.

const QUICK_TAGS = [
  { icon: Film, label: "Movies", search: "movie" },
  { icon: Tv, label: "TV Shows", search: "series" },
  { icon: Compass, label: "Discover", search: "trending" },
];

const PAGE_SIZE = 20;

async function searchContent(query: string, page: number): Promise<{ items: ContentItem[]; hasMore: boolean }> {
  if (!query.trim()) return { items: [], hasMore: false };

  // Fetch news results from the server-side API — the cheapest targeted search
  const responses = await Promise.allSettled([
    fetch(`/api/news?category=general&search=${encodeURIComponent(query)}`),
    fetch(`/api/movies?search=${encodeURIComponent(query)}`),
    fetch(`/api/reddit?search=${encodeURIComponent(query)}`),
    fetch(`/api/music`),
    fetch(`/api/gaming`),
    fetch(`/api/science`),
    fetch(`/api/food`),
    fetch(`/api/anime`),
    fetch(`/api/sports`),
    fetch(`/api/forum`),
  ]);

  const items: ContentItem[] = [];

  for (const res of responses) {
    if (res.status !== "fulfilled" || !res.value.ok) continue;
    const json = await res.value.json();
    // Each route returns an array under different keys
    const arr: ContentItem[] = json.articles ?? json.movies ?? json.posts ?? [];
    if (Array.isArray(arr)) items.push(...arr);
  }

  // Client-side text filter across ALL returned items
  const q = query.toLowerCase();
  const filtered = items.filter((i) => {
    const titleStr = String(i.title || "").toLowerCase();
    const descStr = String(i.description || "").toLowerCase();
    const sourceStr = typeof i.source === "string" 
      ? i.source.toLowerCase() 
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      : String((i.source as any)?.name || "").toLowerCase();
    
    return titleStr.includes(q) || descStr.includes(q) || sourceStr.includes(q);
  });

  const start = page * PAGE_SIZE;
  const slice = filtered.slice(start, start + PAGE_SIZE);
  return { items: slice, hasMore: filtered.length > start + PAGE_SIZE };
}

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const debouncedQuery = useAppSelector((s) => s.preferences.searchQuery);
  const [localQuery, setLocalQuery] = useState(debouncedQuery);
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const observerRef = useRef<IntersectionObserver | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Sync Redux debouncedQuery to local input value
  useEffect(() => {
    setLocalQuery(debouncedQuery);
  }, [debouncedQuery]);

  // Fresh search on new query
  useEffect(() => {
    if (!debouncedQuery) {
      Promise.resolve().then(() => {
        setItems([]);
        setPage(0);
        setHasMore(false);
      });
      return;
    }
    Promise.resolve().then(() => {
      setLoading(true);
      setItems([]);
      setPage(0);
    });
    searchContent(debouncedQuery, 0).then(({ items: next, hasMore: more }) => {
      setItems(next);
      setHasMore(more);
      setLoading(false);
    });
  }, [debouncedQuery]);

  // Load next page
  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoading(true);
    searchContent(debouncedQuery, nextPage).then(({ items: next, hasMore: more }) => {
      setItems((prev) => [...prev, ...next]);
      setHasMore(more);
      setLoading(false);
    });
  }, [loading, hasMore, page, debouncedQuery]);

  // Infinite scroll
  useEffect(() => {
    if (loading || !debouncedQuery) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && hasMore) loadMore(); },
      { threshold: 0.1 }
    );
    if (bottomRef.current) observerRef.current.observe(bottomRef.current);
    return () => observerRef.current?.disconnect();
  }, [loading, hasMore, loadMore, debouncedQuery]);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Search Hero */}
      <div className="flex flex-col items-center justify-center pt-6 pb-4 text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          What are you looking for?
        </h1>
        <p className="mb-8 text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Search across news, movies, and social posts.
        </p>

        {/* Search Input */}
        <div className="relative w-full max-w-2xl group">
          <div className="absolute -inset-1 rounded-full bg-linear-to-r from-primary/30 via-fuchsia-500/20 to-primary/30 opacity-0 blur transition duration-300 group-focus-within:opacity-100" />
          <div className="relative flex items-center rounded-full bg-white/80 dark:bg-dark-2/90 border border-gray-200/80 dark:border-white/10 px-4 py-2 shadow-lg backdrop-blur-md transition-all">
            <Search className="h-5 w-5 text-gray-400 shrink-0 ml-1" />
            <input
              type="text"
              value={localQuery}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                // Update Redux immediately for this page, or we could let AppHeader handle it if it was shared.
                // Since AppHeader isn't rendering this input, we dispatch directly.
                dispatch(setSearchQuery(e.target.value));
              }}
              placeholder="Find Movies, News, Social Posts..."
              className="w-full bg-transparent px-3 py-2 text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
              autoFocus
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery("");
                  dispatch(setSearchQuery(""));
                }}
                className="rounded-full px-3 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/10 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Quick Suggestion Pills */}
        {!debouncedQuery && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 flex flex-wrap justify-center gap-3"
          >
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag.label}
                onClick={() => {
                  setLocalQuery(tag.search);
                  dispatch(setSearchQuery(tag.search));
                }}
                className="flex items-center gap-2 rounded-full border border-gray-200/80 bg-white/60 px-5 py-2 text-xs sm:text-sm font-medium text-gray-600 shadow-sm backdrop-blur transition hover:border-primary/40 hover:bg-white hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 dark:hover:text-white"
              >
                <tag.icon className="h-3.5 w-3.5" />
                {tag.label}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Results */}
      {debouncedQuery && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Results for <span className="font-bold text-gray-900 dark:text-white">&quot;{debouncedQuery}&quot;</span>
            </h2>
            {!loading && items.length > 0 && (
              <span className="text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""} loaded</span>
            )}
          </div>

          <AnimatePresence mode="popLayout">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 items-start">
              {items.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.04 }}
                >
                  <ContentCard item={item} />
                </motion.div>
              ))}

              {loading && Array.from({ length: 4 }).map((_, i) => (
                <div key={`sk-${i}`} className="space-y-3 rounded-xl border border-gray-200/60 bg-white/60 p-4 dark:border-dark-3 dark:bg-gray-dark">
                  <Skeleton className="h-48 w-full rounded-lg" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-2/3 rounded" />
                </div>
              ))}
            </div>
          </AnimatePresence>

          {/* Empty state */}
          {!loading && items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white/40 py-20 text-center backdrop-blur-sm dark:bg-white/5">
              <Film className="mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
              <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300">No results found</h3>
              <p className="mt-1 text-xs text-gray-400">Try searching with a different term or keyword.</p>
            </div>
          )}

          <div ref={bottomRef} className="h-6" />

          {loading && items.length > 0 && (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
