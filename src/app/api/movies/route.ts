import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "dummy_key";
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("historyId");
    const q = searchParams.get("q");
    const lang = searchParams.get("lang") || "en";

    const randomPage = Math.floor(Math.random() * 5) + 1;
    let url = `${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${randomPage}&language=${lang}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allResults: any[] = [];
    
    // If we have a user history ID, try to get recommendations for it
    if (q) {
      url = `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=${lang}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        allResults = data.results || [];
      }
    } else if (historyId) {
      url = `${BASE_URL}/movie/${historyId}/recommendations?api_key=${TMDB_API_KEY}&language=${lang}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        allResults = data.results || [];
      }
    }

    // If recommendations/search are empty, or we don't have a history ID, fetch from multiple orthogonal endpoints
    if (allResults.length === 0) {
      const page = Math.floor(Math.random() * 3) + 1; // Randomize start page slightly to keep it fresh
      const endpoints = [
        `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}&language=${lang}`, // IMDB Top 250 equivalent
        `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page + 1}&language=${lang}`,
        `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}&language=${lang}`,
        `${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}&language=${lang}`,
        `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&page=${page}&language=${lang}`, // Action
        `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&page=${page}&language=${lang}`, // Comedy
        `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878&page=${page}&language=${lang}`, // Sci-Fi
        `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}&language=${lang}`
      ];

      const fetchEndpoint = async (url: string) => {
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          return json.results || [];
        }
        return [];
      };

      const multiCategoryResults = await Promise.all(endpoints.map(fetchEndpoint));
      allResults = multiCategoryResults.flat();
    }

    // Remove duplicates
    const uniqueMap = new Map();
    allResults.forEach(m => uniqueMap.set(m.id, m));
    const data = { results: Array.from(uniqueMap.values()) };

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch TMDB movies" }, { status: 500 });
  }
}
