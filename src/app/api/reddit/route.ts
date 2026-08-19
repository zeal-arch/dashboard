import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Map common HN story domains → relevant Unsplash images
const DOMAIN_IMAGE_MAP: Record<string, string> = {
  "github.com":      "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&fit=crop&q=80",
  "openai.com":      "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&fit=crop&q=80",
  "google.com":      "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=800&fit=crop&q=80",
  "apple.com":       "https://images.unsplash.com/photo-1611186871525-f6b01d38bc6b?w=800&fit=crop&q=80",
  "microsoft.com":   "https://images.unsplash.com/photo-1633419461186-7d40a38105ec?w=800&fit=crop&q=80",
  "amazon.com":      "https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=800&fit=crop&q=80",
  "arxiv.org":       "https://images.unsplash.com/photo-1532094349884-543559c5b185?w=800&fit=crop&q=80",
  "techcrunch.com":  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&fit=crop&q=80",
  "bloomberg.com":   "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&fit=crop&q=80",
  "arstechnica.com": "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&fit=crop&q=80",
  "wired.com":       "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop&q=80",
  "nytimes.com":     "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&fit=crop&q=80",
  "reddit.com":      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&fit=crop&q=80",
  "youtube.com":     "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=800&fit=crop&q=80",
};

const KEYWORD_IMAGE_MAP: Array<{ keywords: string[]; image: string }> = [
  { keywords: ["ai", "llm", "gpt", "neural", "machine learning", "model"], image: "https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&fit=crop&q=80" },
  { keywords: ["security", "hack", "breach", "vulnerability", "exploit"], image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&fit=crop&q=80" },
  { keywords: ["startup", "funding", "vc", "series", "raised"], image: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&fit=crop&q=80" },
  { keywords: ["rust", "python", "typescript", "javascript", "golang", "programming"], image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&fit=crop&q=80" },
  { keywords: ["linux", "open source", "kernel", "debian", "ubuntu"], image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&fit=crop&q=80" },
  { keywords: ["space", "nasa", "rocket", "satellite", "orbit"], image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&fit=crop&q=80" },
  { keywords: ["database", "postgres", "sql", "redis", "mongodb"], image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&fit=crop&q=80" },
  { keywords: ["web", "browser", "html", "css", "frontend"], image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&fit=crop&q=80" },
  { keywords: ["cloud", "aws", "azure", "docker", "kubernetes"], image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&fit=crop&q=80" },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&fit=crop&q=80",
  "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&fit=crop&q=80",
];

function getSmartImage(title: string, url: string, storyIndex: number): string {
  // 1. Try domain match
  try {
    const domain = new URL(url).hostname.replace("www.", "");
    for (const [key, img] of Object.entries(DOMAIN_IMAGE_MAP)) {
      if (domain.includes(key)) return img;
    }
  } catch { /* invalid URL */ }

  // 2. Try keyword match on title
  const lowerTitle = title.toLowerCase();
  for (const { keywords, image } of KEYWORD_IMAGE_MAP) {
    if (keywords.some(kw => lowerTitle.includes(kw))) return image;
  }

  // 3. Cycle through fallbacks so posts look visually different
  return FALLBACK_IMAGES[storyIndex % FALLBACK_IMAGES.length];
}

export async function GET() {
  try {
    // Fetch multiple story lists concurrently for extreme variety
    const endpoints = [
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      "https://hacker-news.firebaseio.com/v0/beststories.json",
      "https://hacker-news.firebaseio.com/v0/newstories.json",
      "https://hacker-news.firebaseio.com/v0/askstories.json",
      "https://hacker-news.firebaseio.com/v0/showstories.json"
    ];

    const listsRes = await Promise.allSettled(endpoints.map(e => fetch(e)));
    const allIds: number[] = [];
    
    for (const res of listsRes) {
      if (res.status === 'fulfilled' && res.value.ok) {
        const ids = await res.value.json();
        // Grab top 30 from each category to mix it up
        allIds.push(...ids.slice(0, 30));
      }
    }

    // Deduplicate IDs
    const uniqueIds = Array.from(new Set(allIds)).sort(() => 0.5 - Math.random()).slice(0, 150);

    const stories: Array<{ id: number; by: string; title: string; time: number; url?: string }> =
      await Promise.all(
        uniqueIds.map((id: number) =>
          fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
        )
      );

    const formattedData = {
      data: {
        children: stories.map((story, idx) => {
          const storyUrl = story.url || `https://news.ycombinator.com/item?id=${story.id}`;
          return {
            data: {
              id: story.id.toString(),
              author: story.by,
              title: story.title,
              permalink: `/item?id=${story.id}`,
              created_utc: story.time,
              // Inject a smart image based on domain/keywords
              preview: {
                images: [{
                  source: { url: getSmartImage(story.title, storyUrl, idx) }
                }]
              }
            }
          };
        })
      }
    };

    return NextResponse.json(formattedData);
  } catch {
    return NextResponse.json({ error: "Failed to fetch social posts" }, { status: 500 });
  }
}
