import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GNEWS_API_KEY = process.env.NEXT_PUBLIC_NEWS_API_KEY || "";
const BASE_URL = "https://gnews.io/api/v4";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || searchParams.get("q") || "";
  const lang = searchParams.get("lang") || "en";
  let category = searchParams.get("category") || "general";

  try {
    // Try GNews first if we have a key that doesn't look obviously malformed/dummy
    if (GNEWS_API_KEY && !GNEWS_API_KEY.includes("dummy") && !GNEWS_API_KEY.includes("moviedb")) {
      let url = "";
      if (search) {
        url = `${BASE_URL}/search?q=${encodeURIComponent(search)}&lang=${lang}&max=100&apikey=${GNEWS_API_KEY}`;
      } else {
        url = `${BASE_URL}/top-headlines?category=${category}&lang=${lang}&max=100&apikey=${GNEWS_API_KEY}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
      // eslint-disable-next-line no-console
      console.warn(`GNews API failed with status ${response.status}. Falling back to mock API.`);
    }

    // Fallback: Saurav's API only supports these exact categories
    const validCategories = ["business", "entertainment", "general", "health", "science", "sports", "technology"];
    if (!validCategories.includes(category)) {
      category = "general";
    }

    const fallbackUrl = `https://saurav.tech/NewsAPI/top-headlines/category/${category}/in.json`;
    const response = await fetch(fallbackUrl);
    
    if (!response.ok) {
      return NextResponse.json({ error: `News API error: ${response.status}` }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
