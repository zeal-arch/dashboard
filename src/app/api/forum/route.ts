import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface ChanThread { no: number; sub?: string; com?: string; tim?: number; ext?: string; time: number; replies?: number; sticky?: number; }
interface ChanPage { threads?: ChanThread[]; }

export async function GET() {
  try {
    const board = 'g';
    const response = await fetch(`https://a.4cdn.org/${board}/catalog.json`, {
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `4chan API error: ${response.status}` }, { status: response.status });
    }

    const pages: ChanPage[] = await response.json();

    let threads: ChanThread[] = [];
    pages.slice(0, 3).forEach((page) => {
      if (page.threads) threads = [...threads, ...page.threads];
    });

    const top = threads
      .filter((t) => !t.sticky && t.tim && t.ext)
      .sort((a, b) => (b.replies || 0) - (a.replies || 0))
      .slice(0, 10);

    return NextResponse.json({ board, threads: top });
  } catch (err) {
    return NextResponse.json({ error: `Failed to fetch forum: ${err}` }, { status: 500 });
  }
}
