import { ContentItem } from "../store/contentSlice";

interface SaavnSong {
  id: string;
  name?: string;
  primaryArtists?: string;
  label?: string;
  image?: Array<{ url: string }> | string;
  url?: string;
  releaseDate?: string;
}

export async function fetchTrendingMusic(historyId?: string, search: string = "", lang: string = "en"): Promise<ContentItem[]> {
  const url = historyId ? `/api/music?historyId=${encodeURIComponent(historyId)}` : "/api/music";
  const baseUrl = url.split('?')[0];
    const existingQuery = url.split('?')[1] || '';
    const queryParams = new URLSearchParams(existingQuery);
    if (search) queryParams.append("q", search);
    if (lang) queryParams.append("lang", lang);
    const finalUrl = baseUrl + "?" + queryParams.toString();
    const response = await fetch(finalUrl);
  if (!response.ok) return [];
  const json = await response.json();
  if (!Array.isArray(json.songs)) return [];

  return json.songs.map((song: SaavnSong) => ({
    id: `saavn-${song.id || Math.random().toString(36).substring(7)}`,
    type: "music" as const,
    title: song.name || "Unknown Track",
    description: song.primaryArtists || song.label || "Unknown Artist",
    image: Array.isArray(song.image)
      ? song.image[song.image.length - 1]?.url || ""
      : (song.image as string) || "",
    url: song.url || "https://www.jiosaavn.com/",
    source: "JioSaavn",
    publishedAt: song.releaseDate
      ? new Date(song.releaseDate).toISOString()
      : new Date().toISOString(),
    category: "music",
  }));
}

