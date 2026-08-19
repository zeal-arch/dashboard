import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface BreweryRecord { id: string; name: string; brewery_type?: string; city?: string; state_province?: string; website_url?: string; }
interface FruitRecord { id: number; name: string; nutritions?: { calories?: number; carbohydrates?: number; protein?: number }; }

export async function GET() {
  const [brewRes, fruitRes] = await Promise.allSettled([
    fetch('https://api.openbrewerydb.org/v1/breweries/random?size=5', { next: { revalidate: 0 } }),
    fetch('https://www.fruityvice.com/api/fruit/all', { next: { revalidate: 0 } }),
  ]);

  const breweries: BreweryRecord[] = [];
  if (brewRes.status === 'fulfilled' && brewRes.value.ok) {
    const data = await brewRes.value.json();
    if (Array.isArray(data)) breweries.push(...data);
  }

  const fruits: FruitRecord[] = [];
  if (fruitRes.status === 'fulfilled' && fruitRes.value.ok) {
    const data: FruitRecord[] = await fruitRes.value.json();
    if (Array.isArray(data)) {
      fruits.push(...[...data].sort(() => 0.5 - Math.random()).slice(0, 5));
    }
  }

  return NextResponse.json({ breweries, fruits });
}
