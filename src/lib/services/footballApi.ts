import { ContentItem } from "../store/contentSlice";

interface FootballTeam { name: string; logo?: string; }
interface FootballFixture { id: number; date?: string; venue?: { name?: string }; }
interface FootballLeague { name: string; logo?: string; }
interface FootballGoals { home?: number; away?: number; }
interface FootballMatch {
  fixture: FootballFixture;
  teams: { home: FootballTeam; away: FootballTeam };
  league: FootballLeague;
  goals?: FootballGoals;
}

export async function fetchTrendingSports(): Promise<ContentItem[]> {
  const response = await fetch("/api/sports");
  if (!response.ok) return [];
  const json = await response.json();
  if (!Array.isArray(json.fixtures) || json.fixtures.length === 0) return [];

  return json.fixtures.map((match: FootballMatch) => ({
    id: `football-${match.fixture.id}`,
    type: "sports" as const,
    title: `${match.teams.home.name} vs ${match.teams.away.name}`,
    description: match.goals
      ? `${match.league.name} · Final: ${match.goals.home ?? 0}-${match.goals.away ?? 0}`
      : `${match.league.name} · ${match.fixture.venue?.name ?? "TBD"}`,
    image: match.league.logo || match.teams.home.logo || "https://images.unsplash.com/photo-1518605368461-1e1e38ce8058?auto=format&fit=crop&q=80",
    url: "https://www.api-football.com/",
    source: "API-Football",
    publishedAt: new Date(match.fixture.date || Date.now()).toISOString(),
    category: "sports",
  }));
}
