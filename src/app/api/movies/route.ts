import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "dummy_key";
const BASE_URL = "https://api.themoviedb.org/3";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const historyId = searchParams.get("historyId");

    const randomPage = Math.floor(Math.random() * 5) + 1;
    let url = `${BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}&page=${randomPage}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let allResults: any[] = [];
    
    // If we have a user history ID, try to get recommendations for it
    if (historyId) {
      url = `${BASE_URL}/movie/${historyId}/recommendations?api_key=${TMDB_API_KEY}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        allResults = data.results || [];
      }
    }

    // If recommendations are empty, or we don't have a history ID, fetch from multiple orthogonal endpoints
    if (allResults.length === 0) {
      const page = Math.floor(Math.random() * 3) + 1; // Randomize start page slightly to keep it fresh
      const endpoints = [
        `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page}`, // IMDB Top 250 equivalent
        `${BASE_URL}/movie/top_rated?api_key=${TMDB_API_KEY}&page=${page + 1}`,
        `${BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=${page}`,
        `${BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`,
        `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28&page=${page}`, // Action
        `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35&page=${page}`, // Comedy
        `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=878&page=${page}`, // Sci-Fi
        `${BASE_URL}/trending/movie/week?api_key=${TMDB_API_KEY}&page=${page}`
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
