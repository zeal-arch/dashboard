import { ContentItem } from "../store/contentSlice";

interface ChanThread { no: number; sub?: string; com?: string; tim?: number; ext?: string; time: number; replies?: number; }

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, " ").replace(/\s+/g, " ").trim();
}

export async function fetchTrendingForum(search: string = "", lang: string = "en"): Promise<ContentItem[]> {
  const baseUrl = "/api/forum".split('?')[0];
    const existingQuery = "/api/forum".split('?')[1] || '';
    const queryParams = new URLSearchParams(existingQuery);
    if (search) queryParams.append("q", search);
    if (lang) queryParams.append("lang", lang);
    const finalUrl = baseUrl + "?" + queryParams.toString();
    const response = await fetch(finalUrl);
  if (!response.ok) return [];
  const json = await response.json();
  if (!Array.isArray(json.threads)) return [];

  const board = json.board || "g";

  return json.threads.map((thread: ChanThread) => ({
    id: `4chan-${thread.no}`,
    type: "forum" as const,
    title: stripHtml(thread.sub) || `Thread #${thread.no}`,
    description: stripHtml(thread.com) || "Click to view thread.",
    image: thread.tim && thread.ext
      ? `https://i.4cdn.org/${board}/${thread.tim}${thread.ext}`
      : "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&q=80",
    url: `https://boards.4channel.org/${board}/thread/${thread.no}`,
    source: `4chan /${board}/`,
    publishedAt: new Date(thread.time * 1000).toISOString(),
    category: "technology",
  }));
}
