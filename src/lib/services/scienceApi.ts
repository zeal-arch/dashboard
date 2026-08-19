import { ContentItem } from "../store/contentSlice";

interface SpacecraftRecord { id: number; name: string; }

export async function fetchTrendingScience(): Promise<ContentItem[]> {
  const response = await fetch("/api/science");
  if (!response.ok) return [];
  const json = await response.json();
  if (!Array.isArray(json.spacecrafts)) return [];

  return json.spacecrafts.map((craft: SpacecraftRecord) => ({
    id: `isro-${craft.id}`,
    type: "science" as const,
    title: craft.name,
    description: "ISRO Historical Spacecraft",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80",
    url: "https://www.isro.gov.in/",
    source: "ISRO Spacecraft API",
    publishedAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    category: "science",
  }));
}
