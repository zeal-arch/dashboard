import { ContentItem } from "../store/contentSlice";

const FALLBACK_NEWS_IMAGE = "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800";

export async function fetchNews(categories: string[], search: string = ""): Promise<ContentItem[]> {
  try {
    // Fetch for each selected category in parallel so all pills are represented.
    // However, we blacklist categories that are meant to be pure media/data feeds.
    const NEWS_BLACKLIST = ["music", "entertainment", "anime", "gaming", "food", "sports", "social"];
    const fetchTargets = categories.length > 0 
      ? categories.filter(c => !NEWS_BLACKLIST.includes(c)) 
      : ["technology"]; // Default fallback for empty feed

    if (fetchTargets.length === 0 && !search) {
      return []; // All selected categories are blacklisted from news, and there is no global search
    }

    const results = await Promise.allSettled(
      fetchTargets.map(async (category) => {
        let url = `/api/news?category=${category}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`News API error: ${response.status}`);
        const data = await response.json();

        if (!data.articles) return [];

        // Shuffle before limiting to get a random subset of 100 articles if the API returns hundreds
        const shuffled = data.articles.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 100).map((article: { title: string, description: string, image: string, url: string, source: { name: string }, publishedAt: string }) => ({
          id: `gnews-${category}-${encodeURIComponent(article.url || article.title)}`,
          type: "news" as const,
          title: article.title,
          description: article.description || "No description available.",
          image: article.image || FALLBACK_NEWS_IMAGE,
          url: article.url,
          source: article.source.name,
          publishedAt: new Date(article.publishedAt).toISOString(),
          category, // correctly tag each article with its actual category
        }));
      })
    );

    const allArticles: ContentItem[] = [];
    for (const result of results) {
      if (result.status === "fulfilled") allArticles.push(...result.value);
    }
    return allArticles;
  } catch {
    return [];
  }
}
