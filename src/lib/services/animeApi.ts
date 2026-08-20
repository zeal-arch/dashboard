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

export async function fetchTrendingAnime(search: string = "", lang: string = "en"): Promise<ContentItem[]> {
  const baseUrl = "/api/anime".split('?')[0];
    const existingQuery = "/api/anime".split('?')[1] || '';
    const queryParams = new URLSearchParams(existingQuery);
    if (search) queryParams.append("q", search);
    if (lang) queryParams.append("lang", lang);
    const finalUrl = baseUrl + "?" + queryParams.toString();
    const response = await fetch(finalUrl);
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
