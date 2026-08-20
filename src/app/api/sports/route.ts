import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;

export async function GET() {
  if (!FOOTBALL_API_KEY || FOOTBALL_API_KEY.includes('dummy')) {
    return NextResponse.json({
      fixtures: [
        {
          fixture: { id: 101, date: new Date().toISOString(), venue: { name: "Wembley Stadium" } },
          teams: { home: { name: "Arsenal", logo: "https://media.api-sports.io/football/teams/42.png" }, away: { name: "Chelsea", logo: "https://media.api-sports.io/football/teams/49.png" } },
          league: { name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
          goals: { home: 2, away: 1 }
        },
        {
          fixture: { id: 102, date: new Date().toISOString(), venue: { name: "Anfield" } },
          teams: { home: { name: "Liverpool", logo: "https://media.api-sports.io/football/teams/40.png" }, away: { name: "Man City", logo: "https://media.api-sports.io/football/teams/50.png" } },
          league: { name: "Premier League", logo: "https://media.api-sports.io/football/leagues/39.png" },
          goals: { home: 1, away: 1 }
        },
        {
          fixture: { id: 103, date: new Date().toISOString(), venue: { name: "Santiago Bernabéu" } },
          teams: { home: { name: "Real Madrid", logo: "https://media.api-sports.io/football/teams/541.png" }, away: { name: "Barcelona", logo: "https://media.api-sports.io/football/teams/529.png" } },
          league: { name: "La Liga", logo: "https://media.api-sports.io/football/leagues/140.png" },
          goals: { home: 3, away: 2 }
        }
      ]
    });
  }

  try {
    // Fetch Live, Past, and Upcoming fixtures simultaneously for a massive sports feed
    const endpoints = [
      'https://v3.football.api-sports.io/fixtures?live=all',
      'https://v3.football.api-sports.io/fixtures?last=50',
      'https://v3.football.api-sports.io/fixtures?next=50'
    ];

    const results = await Promise.allSettled(
      endpoints.map(url => 
        fetch(url, {
          headers: { 'x-apisports-key': FOOTBALL_API_KEY },
          next: { revalidate: 0 }
        }).then(r => r.ok ? r.json() : { response: [] })
      )
    );

    interface SportsFixtureItem {
      fixture?: { id?: number | string };
      [key: string]: unknown;
    }

    const allFixtures: SportsFixtureItem[] = [];
    results.forEach(res => {
      if (res.status === 'fulfilled' && res.value.response) {
        allFixtures.push(...res.value.response);
      }
    });

    // Deduplicate by fixture ID
    const uniqueMap = new Map();
    allFixtures.forEach(fix => {
      if (fix.fixture?.id && !uniqueMap.has(fix.fixture.id)) {
        uniqueMap.set(fix.fixture.id, fix);
      }
    });

    return NextResponse.json({ fixtures: Array.from(uniqueMap.values()) });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch sports: ${err}` }, { status: 500 });
  }
}
