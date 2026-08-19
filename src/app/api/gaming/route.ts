import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface GameRecord {
  id: number;
  title: string;
  short_description: string;
  genre: string;
  platform: string;
  developer?: string;
  publisher?: string;
  thumbnail: string;
  game_url?: string;
  freetogame_profile_url?: string;
  release_date?: string;
}

export async function GET() {
  try {
    const response = await fetch('https://www.freetogame.com/api/games', {
      headers: { 'User-Agent': 'PersonalizedDashboard/1.0' },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `FreeToGame API error: ${response.status}` }, { status: response.status });
    }

    const games: GameRecord[] = await response.json();

    if (!Array.isArray(games) || games.length === 0) {
      return NextResponse.json({ games: [] });
    }

    // Shuffle server-side and return 100
    const shuffled = [...games].sort(() => 0.5 - Math.random()).slice(0, 100);
    return NextResponse.json({ games: shuffled });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch gaming data: ${err}` }, { status: 500 });
  }
}
