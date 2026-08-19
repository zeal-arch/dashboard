import { ContentItem } from "../store/contentSlice";

interface BreweryRecord { id: string; name: string; brewery_type?: string; city?: string; state_province?: string; website_url?: string; }
interface FruitRecord { id: number; name: string; nutritions?: { calories?: number; carbohydrates?: number; protein?: number }; }

export async function fetchTrendingFood(): Promise<ContentItem[]> {
  const response = await fetch("/api/food");
  if (!response.ok) return [];
  const json = await response.json();

  const items: ContentItem[] = [];
  const now = Date.now();

  if (Array.isArray(json.breweries)) {
    json.breweries.forEach((b: BreweryRecord) => {
      items.push({
        id: `food-brew-${b.id}`,
        type: "food" as const,
        title: b.name,
        description: `${b.brewery_type ? b.brewery_type.charAt(0).toUpperCase() + b.brewery_type.slice(1) : "Craft"} Brewery · ${b.city || "Unknown"}, ${b.state_province || ""}`,
        image: "https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&q=80",
        url: b.website_url || "https://www.openbrewerydb.org/",
        source: "OpenBreweryDB",
        publishedAt: new Date(now - Math.random() * 86400000 * 7).toISOString(),
        category: "food",
      });
    });
  }

  if (Array.isArray(json.fruits)) {
    json.fruits.forEach((f: FruitRecord) => {
      items.push({
        id: `food-fruit-${f.id}`,
        type: "food" as const,
        title: f.name,
        description: `Fruit · ${f.nutritions?.calories ?? "?"} kcal · ${f.nutritions?.carbohydrates ?? "?"}g Carbs · ${f.nutritions?.protein ?? "?"}g Protein`,
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80",
        url: "https://www.fruityvice.com/",
        source: "Fruityvice",
        publishedAt: new Date(now - Math.random() * 86400000 * 7).toISOString(),
        category: "food",
      });
    });
  }

  return items;
}
