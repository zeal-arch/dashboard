import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface ContentItem {
  id: string;
  type: "news" | "movie" | "social";
  title: string;
  description: string;
  image: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

interface ContentState {
  items: ContentItem[];
  trending: ContentItem[];
  loading: boolean;
  error: string | null;
  page: number;
  hasMore: boolean;
}

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK_NEWS: ContentItem[] = [
  { id: "n1", type: "news", title: "OpenAI Releases GPT-5 with Breakthrough Reasoning", description: "The latest model shows unprecedented performance on complex reasoning benchmarks, surpassing human experts in multiple domains.", image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800", url: "#", source: "TechCrunch", publishedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), category: "technology" },
  { id: "n2", type: "news", title: "Apple Vision Pro 2 Set to Launch with Major Price Cut", description: "Sources indicate the second generation spatial computing device will be 40% cheaper, making it more accessible to consumers.", image: "https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=800", url: "#", source: "The Verge", publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), category: "technology" },
  { id: "n3", type: "news", title: "Global Markets Rally as Inflation Data Comes in Lower", description: "Stocks surged across major indices following a surprise drop in CPI data, with tech and financial sectors leading the gains.", image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800", url: "#", source: "Bloomberg", publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), category: "finance" },
  { id: "n4", type: "news", title: "Scientists Discover New Exoplanet in Habitable Zone", description: "Astronomers at NASA have confirmed a potentially habitable planet just 12 light-years from Earth using the James Webb Telescope.", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800", url: "#", source: "NASA", publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), category: "science" },
  { id: "n5", type: "news", title: "Premier League Transfer Window: Top 10 Deals Confirmed", description: "Several blockbuster transfers have been confirmed as clubs race to strengthen their squads ahead of the new season.", image: "https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=800", url: "#", source: "ESPN", publishedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(), category: "sports" },
  { id: "n6", type: "news", title: "New Study Links Mediterranean Diet to Longevity", description: "A 20-year longitudinal study of 10,000 participants confirms significant health benefits from adherence to a Mediterranean-style diet.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800", url: "#", source: "HealthLine", publishedAt: new Date(Date.now() - 1000 * 60 * 300).toISOString(), category: "health" },
];

const MOCK_MOVIES: ContentItem[] = [
  { id: "m1", type: "movie", title: "Dune: Messiah", description: "The epic continuation of Paul Atreides' journey as he navigates the complex politics of Arrakis and the wider universe.", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800", url: "#", source: "TMDB", publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(), category: "entertainment" },
  { id: "m2", type: "movie", title: "The Batman Returns", description: "Bruce Wayne faces a new threat to Gotham as the Riddler resurfaces with a cryptic plan targeting the city's elite.", image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=800", url: "#", source: "TMDB", publishedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), category: "entertainment" },
  { id: "m3", type: "movie", title: "Interstellar 2: Beyond the Horizon", description: "A new crew ventures beyond the wormhole to find signs of Cooper's mission and discover what lies at the edge of the universe.", image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=800", url: "#", source: "TMDB", publishedAt: new Date(Date.now() - 1000 * 60 * 200).toISOString(), category: "entertainment" },
  { id: "m4", type: "movie", title: "Parasite II", description: "Bong Joon-ho returns with a new chapter exploring class disparity in modern Korean society through a family's desperate struggle.", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800", url: "#", source: "TMDB", publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(), category: "entertainment" },
];

const MOCK_SOCIAL: ContentItem[] = [
  { id: "s1", type: "social", title: "@elonmusk", description: "Just had the most incredible conversation with the new AI. It solved a problem that stumped our engineers for weeks. The future is here. 🚀", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800", url: "#", source: "Twitter/X", publishedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), category: "technology" },
  { id: "s2", type: "social", title: "@NASA", description: "🚀 T-2 hours until launch! The Artemis III crew is suited up and ready. Watch live as we return humans to the lunar surface for the first time in 50 years! #Artemis #Moon", image: "https://images.unsplash.com/photo-1541185934-01b600ea069c?w=800", url: "#", source: "Twitter/X", publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), category: "science" },
  { id: "s3", type: "social", title: "@BarackObama", description: "Proud to see young people leading the charge on climate action. The next generation gives me hope. Keep pushing. The world is counting on you.", image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800", url: "#", source: "Twitter/X", publishedAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(), category: "health" },
  { id: "s4", type: "social", title: "@GitHub", description: "GitHub Copilot can now write entire applications from a single prompt. We tested it on 500 real-world projects — the results are mind-blowing. Thread 🧵👇", image: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800", url: "#", source: "Twitter/X", publishedAt: new Date(Date.now() - 1000 * 60 * 130).toISOString(), category: "technology" },
];

const ALL_ITEMS = [...MOCK_NEWS, ...MOCK_MOVIES, ...MOCK_SOCIAL].sort(
  (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
);

// ── Async Thunks ──────────────────────────────────────────────────────────────
export const fetchContent = createAsyncThunk(
  "content/fetchContent",
  async ({ categories, page = 0, search = "" }: { categories: string[]; page?: number; search?: string }) => {
    // Simulate API delay
    await new Promise((r) => setTimeout(r, 600));

    let items = ALL_ITEMS;

    if (search) {
      items = items.filter(
        (i) =>
          i.title.toLowerCase().includes(search.toLowerCase()) ||
          i.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categories.length > 0) {
      items = items.filter((i) => categories.includes(i.category) || i.type === "social");
    }

    const pageSize = 6;
    const start = page * pageSize;
    const paged = items.slice(start, start + pageSize);
    return { items: paged, hasMore: start + pageSize < items.length, page };
  }
);

export const fetchTrending = createAsyncThunk("content/fetchTrending", async () => {
  await new Promise((r) => setTimeout(r, 400));
  return [...ALL_ITEMS].slice(0, 6);
});

// ── Slice ──────────────────────────────────────────────────────────────────────
const initialState: ContentState = {
  items: [],
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
        if (action.payload.page === 0) {
          state.items = action.payload.items;
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
        state.trending = action.payload;
      });
  },
});

export const { resetContent, reorderItems } = contentSlice.actions;
export default contentSlice.reducer;
