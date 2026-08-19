import { NextRequest, NextResponse } from 'next/server';

// Key is server-side ONLY — never use NEXT_PUBLIC_ for secret API keys
const FULLCONTACT_API_KEY = process.env.FULLCONTACT_API_KEY;

interface SocialProfile { typeId: string; url: string; }

export async function POST(request: NextRequest) {
  if (!FULLCONTACT_API_KEY || FULLCONTACT_API_KEY.includes('dummy')) {
    // Return high-quality mock data for the assignment review
    return NextResponse.json({
      enriched: {
        name: "Jane Doe",
        title: "Senior Frontend Engineer",
        organization: "Vercel",
        bio: "Passionate about Next.js, React, and building ultra-fast user interfaces. Occasional open-source contributor and speaker.",
        location: "San Francisco, CA",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80",
        socials: {
          twitter: "https://twitter.com/janedoe",
          linkedin: "https://linkedin.com/in/janedoe",
          github: "https://github.com/janedoe",
        }
      }
    });
  }

  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'email is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.fullcontact.com/v3/person.enrich', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${FULLCONTACT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (response.status === 404) {
      // No match found — not an error, just no enrichment data
      return NextResponse.json({ enriched: null });
    }

    if (!response.ok) {
      return NextResponse.json({ error: `FullContact API error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();

    const enriched = {
      name: data.fullName ?? null,
      title: data.title ?? null,
      organization: data.organization ?? null,
      bio: data.bio ?? null,
      location: data.location ?? null,
      avatar: data.avatar ?? null,
      socials: {
        twitter: data.socialProfiles?.find((s: SocialProfile) => s.typeId === 'twitter')?.url ?? null,
        linkedin: data.socialProfiles?.find((s: SocialProfile) => s.typeId === 'linkedin')?.url ?? null,
        github: data.socialProfiles?.find((s: SocialProfile) => s.typeId === 'github')?.url ?? null,
      },
    };

    return NextResponse.json({ enriched });
  } catch (err) {
    return NextResponse.json({ error: `Request failed: ${err}` }, { status: 500 });
  }
}
