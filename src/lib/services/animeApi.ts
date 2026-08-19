import { ContentItem } from "../store/contentSlice";

interface JikanAnime {
  mal_id: number;
  title: string;
  synopsis?: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  url?: string;
  episodes?: number;
  score?: number;
  aired?: { from?: string };
}

export async function fetchTrendingAnime(): Promise<ContentItem[]> {
  const response = await fetch("/api/anime");
  if (!response.ok) return [];
  const json = await response.json();
  if (!Array.isArray(json.anime)) return [];

  return json.anime.map((a: JikanAnime) => ({
    id: `anime-${a.mal_id}`,
    type: "anime" as const,
    title: a.title,
    description: a.synopsis
      ? a.synopsis.slice(0, 140) + (a.synopsis.length > 140 ? "…" : "")
      : `Score: ${a.score ?? "N/A"} · Episodes: ${a.episodes ?? "?"}`,
    image: a.images?.jpg?.large_image_url || a.images?.jpg?.image_url || "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&q=80",
    url: a.url || "https://myanimelist.net/",
    source: "MyAnimeList",
    publishedAt: a.aired?.from ? new Date(a.aired.from).toISOString() : new Date().toISOString(),
    category: "anime",
  }));
}
