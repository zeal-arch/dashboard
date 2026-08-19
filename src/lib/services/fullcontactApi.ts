// Calls the internal /api/profile-enrich route — the FullContact API key stays server-side.
// Returns null (not mock data) when no enrichment is available.

export interface EnrichedProfile {
  name: string | null;
  title: string | null;
  organization: string | null;
  bio: string | null;
  location: string | null;
  avatar: string | null;
  socials: {
    twitter?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
}

export async function enrichUserProfile(email: string): Promise<EnrichedProfile | null> {
  try {
    const response = await fetch('/api/profile-enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) return null;

    const json = await response.json();
    return json.enriched ?? null;
  } catch {
    return null;
  }
}
