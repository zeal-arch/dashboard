import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface JikanAnime {
  mal_id: number;
  title: string;
  synopsis?: string;
  images?: { jpg?: { large_image_url?: string; image_url?: string } };
  url?: string;
  episodes?: number;
  score?: number;
  aired?: { from?: string };
}

export async function GET() {
  try {
    const fetchEndpoint = async (url: string) => {
      const res = await fetch(url, { next: { revalidate: 0 } });
      if (res.ok) {
        const json = await res.json();
        return json.data || [];
      }
      return [];
    };

    const endpoints = [
      `https://api.jikan.moe/v4/top/anime?limit=25&page=${Math.floor(Math.random() * 5) + 1}`,
      `https://api.jikan.moe/v4/seasons/now?limit=25`,
      `https://api.jikan.moe/v4/seasons/upcoming?limit=25`
    ];

    const multiEndpointResults = await Promise.all(endpoints.map(fetchEndpoint));
    
    // Deduplicate by mal_id
    const allAnime = multiEndpointResults.flat();
    const uniqueMap = new Map();
    allAnime.forEach((a: JikanAnime) => {
      if (a.mal_id && !uniqueMap.has(a.mal_id)) {
        uniqueMap.set(a.mal_id, a);
      }
    });
    const anime: JikanAnime[] = Array.from(uniqueMap.values());

    return NextResponse.json({ anime });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch anime: ${err}` }, { status: 500 });
  }
}
