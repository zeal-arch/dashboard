import { ContentItem } from "../store/contentSlice";

// Fallback image if reddit post has no image
const REDDIT_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800";

export async function fetchRedditPosts(search: string = "", lang: string = "en"): Promise<ContentItem[]> {
  try {
    const baseUrl = "/api/reddit".split('?')[0];
    const existingQuery = "/api/reddit".split('?')[1] || '';
    const queryParams = new URLSearchParams(existingQuery);
    if (search) queryParams.append("q", search);
    if (lang) queryParams.append("lang", lang);
    const finalUrl = baseUrl + "?" + queryParams.toString();
    const response = await fetch(finalUrl);
    if (!response.ok) {
      throw new Error("Reddit API error");
    }
    const data = await response.json();
    
    return data.data.children.map((child: { data: { id: string, author: string, title: string, permalink: string, created_utc: number, preview?: { images: Array<{ source: { url: string } }> } } }) => {
      const post = child.data;
      // Extract image if available, otherwise use fallback
      let image = REDDIT_FALLBACK_IMAGE;
      if (post.preview && post.preview.images && post.preview.images.length > 0) {
        image = post.preview.images[0].source.url.replace(/&amp;/g, "&");
      }

      return {
        id: `reddit-${post.id}`,
        type: "social",
        title: `r/technology • u/${post.author}`,
        description: post.title,
        image: image,
        url: `https://www.reddit.com${post.permalink}`,
        source: "Reddit",
        publishedAt: new Date(post.created_utc * 1000).toISOString(),
        category: "technology", // Assuming r/technology
      };
    });
  } catch {
    return [];
  }
}
