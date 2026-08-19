import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://isro.vercel.app/api/spacecrafts', {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `ISRO API error: ${response.status}` }, { status: response.status });
    }

    const json = await response.json();

    if (!json.spacecrafts || !Array.isArray(json.spacecrafts)) {
      return NextResponse.json({ spacecrafts: [] });
    }

    const shuffled = [...json.spacecrafts].sort(() => 0.5 - Math.random()).slice(0, 10);
    return NextResponse.json({ spacecrafts: shuffled });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch science data: ${err}` }, { status: 500 });
  }
}
