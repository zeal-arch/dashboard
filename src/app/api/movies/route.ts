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

    // Fallback if TMDB API is missing a key in production or returns 401
    if (allResults.length === 0) {
      allResults = [
        { id: 680, title: "Pulp Fiction", overview: "A burger-loving hit man, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in this sprawling, comedic crime caper.", release_date: "1994-09-10", poster_path: "/d5iIlFn5s0ImszYzBPb8SPCPb1s.jpg" },
        { id: 157336, title: "Interstellar", overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel.", release_date: "2014-11-05", poster_path: "/gEU2QlsUUHXjNPeQ121C11z0qeb.jpg" },
        { id: 389, title: "12 Angry Men", overview: "The defense and the prosecution have rested and the jury is filing into the jury room to decide if a young Spanish-American is guilty or innocent of murdering his father.", release_date: "1957-04-10", poster_path: "/ow3wq89wM8qd5X7hWKxiRfsFf9C.jpg" },
        { id: 346, title: "Seven Samurai", overview: "A samurai answers a village's request for protection after he falls on hard times. The town needs protection from bandits.", release_date: "1954-04-26", poster_path: "/8OKmBV5MACMvd8h10z8M8UifZ4I.jpg" },
        { id: 238, title: "The Godfather", overview: "Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.", release_date: "1972-03-14", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg" },
        { id: 13, title: "Forrest Gump", overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events.", release_date: "1994-06-23", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg" },
        { id: 424, title: "Schindler's List", overview: "The true story of how businessman Oskar Schindler saved over a thousand Jewish lives from the Nazis while they worked as slaves.", release_date: "1993-12-15", poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg" },
        { id: 155, title: "The Dark Knight", overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent.", release_date: "2008-07-16", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
        { id: 122, title: "The Lord of the Rings: The Return of the King", overview: "Aragorn is revealed as the heir to the ancient kings as he, Gandalf and the other members of the broken fellowship struggle to save Gondor.", release_date: "2003-12-01", poster_path: "/rCzpDGLbOoPwLjy3OAm5OUk0R0x.jpg" },
        { id: 278, title: "The Shawshank Redemption", overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.", release_date: "1994-09-23", poster_path: "/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg" }
      ];
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
