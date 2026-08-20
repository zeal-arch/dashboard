import { ContentItem } from "../store/contentSlice";

interface GameRecord {
  id: number;
  title: string;
  short_description: string;
  genre: string;
  platform: string;
  developer?: string;
  publisher?: string;
  thumbnail: string;
  game_url?: string;
  freetogame_profile_url?: string;
  release_date?: string;
}

export async function fetchTrendingGaming(search: string = "", lang: string = "en"): Promise<ContentItem[]> {
  const baseUrl = "/api/gaming".split('?')[0];
    const existingQuery = "/api/gaming".split('?')[1] || '';
    const queryParams = new URLSearchParams(existingQuery);
    if (search) queryParams.append("q", search);
    if (lang) queryParams.append("lang", lang);
    const finalUrl = baseUrl + "?" + queryParams.toString();
    const response = await fetch(finalUrl);
  if (!response.ok) return [];
  const json = await response.json();
  if (!Array.isArray(json.games)) return [];

  return json.games.map((game: GameRecord) => ({
    id: `gaming-${game.id}`,
    type: "gaming" as const,
    title: game.title,
    description: `${game.genre} · ${game.platform} · ${game.developer || game.publisher || ""}`,
    image: game.thumbnail,
    url: game.game_url || game.freetogame_profile_url || "https://www.freetogame.com/",
    source: "FreeToGame",
    publishedAt: game.release_date
      ? new Date(game.release_date).toISOString()
      : new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(),
    category: "gaming",
  }));
}
