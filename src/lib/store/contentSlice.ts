import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { Category } from "./preferencesSlice";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ContentItem {
  id: string;
  type: "news" | "movie" | "social" | "music" | "sports" | "forum" | "science" | "food" | "gaming" | "anime";
  title: string;
  description: string;
  image: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  isRecommendation?: boolean;
}

interface ContentState {
  items: ContentItem[];
  recommendedItems: ContentItem[];
  allFetchedItems: ContentItem[];
  trending: ContentItem[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

import { fetchNews } from "../services/newsApi";
import { fetchTrendingMovies } from "../services/tmdbApi";
import { fetchRedditPosts } from "../services/redditApi";
import { fetchTrendingMusic } from "../services/saavnApi";
import { fetchTrendingSports } from "../services/footballApi";
import { fetchTrendingForum } from "../services/fourchanApi";
import { fetchTrendingScience } from "../services/scienceApi";
import { fetchTrendingFood } from "../services/foodApi";
import { fetchTrendingGaming } from "../services/gamingApi";
import { fetchTrendingAnime } from "../services/animeApi";
import { rankRecommendations } from "../services/recommender";

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchContent = createAsyncThunk(
  "content/fetchContent",
  async (
    { categories, page = 0, search = "", forceRefresh = false }: { categories: string[]; page?: number; search?: string; forceRefresh?: boolean },
    { getState }
  ) => {
    const state = getState() as { content: ContentState; favorites: { items: ContentItem[] }; preferences: { interestScores: Record<string, number> } };

    // ── Redux In-Memory Cache Check ───────────────────────────────────────────
    // Skip cache entirely on forceRefresh (browser refresh, Refresh button, category change).
    // Otherwise, on page 0, return existing items to avoid re-fetching on navigation.
    if (!forceRefresh && page === 0 && state.content.items.length > 0) {
      return {
        items: state.content.items,
        hasMore: state.content.hasMore,
        page: 0,
        fromCache: true,
      };
    }

    // Personalise using favorites history
    const favoriteMovies = (state.favorites?.items || []).filter((item) => item.type === "movie");
    const movieHistoryId = favoriteMovies.length > 0
      ? favoriteMovies[favoriteMovies.length - 1].id.replace("tmdb-", "")
      : undefined;

    const favoriteMusic = (state.favorites?.items || []).filter((item) => item.type === "music");
    const musicHistoryId = favoriteMusic.length > 0
      ? favoriteMusic[favoriteMusic.length - 1].id.replace("saavn-", "")
      : undefined;

    let items: ContentItem[] = [];

    if (page > 0) {
      // Client-side pagination: reuse the fully fetched, sorted, and filtered list from page 0
      items = state.content.allFetchedItems;
    } else {
      // Fetch all sources concurrently — any single failure won't break the feed
      const [
        newsResult, moviesResult, redditResult, musicResult,
        sportsResult, forumResult, scienceResult, foodResult,
        gamingResult, animeResult,
      ] = await Promise.allSettled([
        fetchNews(categories, search),
        fetchTrendingMovies(movieHistoryId),
        fetchRedditPosts(),
        fetchTrendingMusic(musicHistoryId),
        fetchTrendingSports(),
        fetchTrendingForum(),
        fetchTrendingScience(),
        fetchTrendingFood(),
        fetchTrendingGaming(),
        fetchTrendingAnime(),
      ]);

      // Push all items WITHOUT pre-flagging anything as isRecommendation.
      // isRecommendation is determined dynamically AFTER category filtering below.
      if (newsResult.status === "fulfilled")    items.push(...newsResult.value);
      if (moviesResult.status === "fulfilled")  items.push(...moviesResult.value);
      if (redditResult.status === "fulfilled")  items.push(...redditResult.value);
      if (musicResult.status === "fulfilled")   items.push(...musicResult.value);
      if (sportsResult.status === "fulfilled")  items.push(...sportsResult.value);
      if (forumResult.status === "fulfilled")   items.push(...forumResult.value);
      if (scienceResult.status === "fulfilled") items.push(...scienceResult.value);
      if (foodResult.status === "fulfilled")    items.push(...foodResult.value);
      if (gamingResult.status === "fulfilled")  items.push(...gamingResult.value);
      if (animeResult.status === "fulfilled")   items.push(...animeResult.value);

      // Client-side search filter
      if (search) {
        const q = search.toLowerCase();
        items = items.filter(
          (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
        );
      }

      // Client-side category filter — movies/music are now regular items, no bypass.
      if (categories.length > 0) {
        items = items.filter((i) => {
          if (categories.includes(i.type as Category)) return true;
          if (i.type === "news" && categories.includes(i.category as Category)) return true;
          if (categories.includes("entertainment") && i.type === "movie") return true;
          if (categories.includes("music") && i.type === "music") return true;
          if (categories.includes("social") && i.type === "forum") return true;
          if (categories.includes("sports") && i.type === "sports") return true;
          if (categories.includes("science") && i.type === "science") return true;
          return false;
        });
      }

      // ── Smart Recommendations via TF-IDF Cosine Similarity ─────────────────
      // Pick the top 8 movies + music from the filtered pool as recommendations.
      // These are only extracted if the user has favorites.
      let recommendedItems: (ContentItem & { isRecommendation?: boolean })[] = [];
      if ((state.favorites?.items?.length || 0) > 0) {
        const recCandidates = items.filter((i) => i.type === "movie" || i.type === "music");
        recommendedItems = rankRecommendations(
          state.favorites?.items || [],
          recCandidates,
          8,
        ).map((i) => ({ ...i, isRecommendation: true }));
      }
      const recommendedIds = new Set(recommendedItems.map((i) => i.id));

      // General feed = everything (including movies/music not in recommendations)
      // so category filtering always works correctly.
      const allFiltered = items.map((i) =>
        recommendedIds.has(i.id) ? { ...i, isRecommendation: true } : i
      );
      const generalItems = allFiltered.filter((i) => !i.isRecommendation);

      // Shuffle first for variety, then sort by pure interest score.
      // Since unselected categories are filtered out above, we don't need artificial +100 boosts anymore.
      // This creates a perfect 'Instagram Explore' style mix of all selected categories.
      generalItems.sort(() => Math.random() - 0.5);
      const interestScores = state.preferences.interestScores || {};
      
      generalItems.sort((a, b) => {
        const scoreA = (interestScores[a.category] || 0) + (interestScores[a.type] || 0);
        const scoreB = (interestScores[b.category] || 0) + (interestScores[b.type] || 0);
        return scoreB - scoreA;
      });
      
      return { 
        items: generalItems.slice(0, 10), 
        recommendedItems,
        allFetchedItems: generalItems, 
        hasMore: 10 < generalItems.length, 
        page, 
        fromCache: false 
      };
    }

    const pageSize = 10;
    const start = page * pageSize;
    const paged = items.slice(start, start + pageSize);

    return { 
      items: paged, 
      recommendedItems: [], // Won't be used on page > 0
      allFetchedItems: items,  // Always an array, never undefined
      hasMore: start + pageSize < items.length, 
      page, 
      fromCache: false 
    };
  }
);

export const fetchTrending = createAsyncThunk(
  "content/fetchTrending",
  async (_, { getState }) => {
    const state = getState() as { content: ContentState };

    // ── Redux In-Memory Cache Check ───────────────────────────────────────────
    if (state.content.trending.length > 0) {
      return { items: state.content.trending, fromCache: true };
    }

    const [
      moviesResult, newsResult, musicResult, sportsResult,
      forumResult, scienceResult, foodResult, gamingResult, animeResult,
    ] = await Promise.allSettled([
      fetchTrendingMovies(),
      fetchNews([], ""),
      fetchTrendingMusic(),
      fetchTrendingSports(),
      fetchTrendingForum(),
      fetchTrendingScience(),
      fetchTrendingFood(),
      fetchTrendingGaming(),
      fetchTrendingAnime(),
    ]);

    const items: ContentItem[] = [];
    
    // Take up to 4 top items from each API to guarantee variety from ALL sources
    if (moviesResult.status === "fulfilled")  items.push(...moviesResult.value.slice(0, 4));
    if (newsResult.status === "fulfilled")    items.push(...newsResult.value.slice(0, 4));
    if (musicResult.status === "fulfilled")   items.push(...musicResult.value.slice(0, 4));
    if (sportsResult.status === "fulfilled")  items.push(...sportsResult.value.slice(0, 4));
    if (forumResult.status === "fulfilled")   items.push(...forumResult.value.slice(0, 4));
    if (scienceResult.status === "fulfilled") items.push(...scienceResult.value.slice(0, 4));
    if (foodResult.status === "fulfilled")    items.push(...foodResult.value.slice(0, 4));
    if (gamingResult.status === "fulfilled")  items.push(...gamingResult.value.slice(0, 4));
    if (animeResult.status === "fulfilled")   items.push(...animeResult.value.slice(0, 4));

    // Sort by recency
    items.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    
    // Return a rich feed of up to 36 trending items
    return { items, fromCache: false };
  }
);

// ── Slice ──────────────────────────────────────────────────────────────────────
const initialState: ContentState = {
  items: [],
  recommendedItems: [],
  allFetchedItems: [],
  trending: [],
  loading: false,
  error: null,
  page: 0,
  hasMore: true,
};

const contentSlice = createSlice({
  name: "content",
  initialState,
  reducers: {
    resetContent(state) {
      state.items = [];
      state.recommendedItems = [];
      state.allFetchedItems = [];
      state.page = 0;
      state.hasMore = true;
    },
    reorderItems(state, action: PayloadAction<ContentItem[]>) {
      state.items = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.fromCache) return; // data already in Redux, no-op
        if (action.payload.page === 0) {
          state.items = action.payload.items;
          state.recommendedItems = action.payload.recommendedItems ?? [];
          state.allFetchedItems = action.payload.allFetchedItems || [];
        } else {
          state.items = [...state.items, ...action.payload.items];
        }
        state.hasMore = action.payload.hasMore;
        state.page = action.payload.page;
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch content";
      })
      .addCase(fetchTrending.fulfilled, (state, action) => {
        if (action.payload.fromCache) return;
        state.trending = action.payload.items;
      });
  },
});

export const { resetContent, reorderItems } = contentSlice.actions;
export default contentSlice.reducer;
