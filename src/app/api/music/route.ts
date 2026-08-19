import { NextRequest, NextResponse } from 'next/server';
import YTMusic from 'ytmusic-api';

export const dynamic = 'force-dynamic';

interface SaavnSong {
  id: string;
  name?: string;
  primaryArtists?: string;
  label?: string;
  image?: Array<{ url: string }> | string;
  url?: string;
  releaseDate?: string;
}

const ytmusic = new YTMusic();
let isInitialized = false;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const historyId = searchParams.get('historyId');

    // Search for related tracks or multiple genres based on history

    try {
      if (!isInitialized) {
        await ytmusic.initialize();
        isInitialized = true;
      }

      // If historyId exists, fetch related + some trending
      // If not, fetch a massive orthogonal variety of genres and artists to guarantee 150+ unique tracks
      const englishGenres = [
        'english pop songs', 'billboard hot 100', 'english rock hits',
        'indie pop english', 'acoustic english covers', 'classic rock english',
        'english r&b hits', 'english country hits', 'alternative rock english',
        '2000s english hits', '90s english hits', 'viral english songs',
        'english edm vocals', 'uk pop hits', 'us top 40'
      ];
      
      const famousArtists = [
        'The Weeknd top hits', 'Taylor Swift best songs', 'Justin Bieber hits',
        'Bruno Mars top tracks', 'DJ Khaled hits', 'Eminem greatest hits',
        'Charlie Puth songs', 'Ed Sheeran top hits', 'Drake hits',
        'Post Malone top tracks', 'Dua Lipa best songs', 'Ariana Grande hits',
        'Billie Eilish top songs', 'Maroon 5 hits', 'Coldplay best songs',
        'Imagine Dragons hits', 'Shawn Mendes top tracks', 'Rihanna greatest hits',
        'Katy Perry hits', 'Lady Gaga top songs', 'Adele best tracks'
      ];

      // Pick 5 random English genres and 5 random artists
      const randomEnglish = englishGenres.sort(() => 0.5 - Math.random()).slice(0, 5);
      const randomArtists = famousArtists.sort(() => 0.5 - Math.random()).slice(0, 5);

      const queries = historyId 
        ? [
            `related:${historyId}`, 
            'latest songs 2024', 
            'new music releases today', 
            'trending viral songs',
            'global top 50', 
            ...randomEnglish.slice(0, 3)
          ] 
        : [
            'trending music', 
            'global top 50', 
            'new music releases',
            'hip hop hits',
            ...randomEnglish,
            ...randomArtists
          ];

      const allResultsNested = await Promise.all(
        queries.map(q => ytmusic.search(q))
      );
      
      const results = allResultsNested.flat();

      // Remove duplicates by videoId
      const uniqueMap = new Map();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      results.forEach((song: any) => {
        if (song.videoId && !uniqueMap.has(song.videoId)) {
          uniqueMap.set(song.videoId, song);
        }
      });
      const uniqueResults = Array.from(uniqueMap.values());

      // Map to the existing SaavnSong interface to prevent UI breakage
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mappedSongs: SaavnSong[] = uniqueResults.map((song: any) => ({
      id: song.videoId || `yt-${Math.random()}`,
      name: song.name,
      primaryArtists: song.artist?.name || "Unknown Artist",
      label: song.album?.name || "YouTube Music",
      image: song.thumbnails && song.thumbnails.length > 0 ? song.thumbnails[song.thumbnails.length - 1].url : "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80",
      url: song.videoId ? `https://music.youtube.com/watch?v=${song.videoId}` : undefined,
    }));

    if (mappedSongs.length > 0) {
      return NextResponse.json({ songs: mappedSongs });
    } else {
      throw new Error("No results returned from YouTube Music API");
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`[Music API] Failed to fetch from YouTube Music, using mock fallback: ${err}`);
    
    // Fallback Mock Data if YT Music is down
    const mockSongs = Array.from({ length: 8 }).map((_, i) => ({
      id: `mock-song-${i}`,
      name: `Trending Track ${i + 1}`,
      primaryArtists: "Various Artists",
      label: "Mock Records",
      image: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&q=80",
      releaseDate: new Date().toISOString()
    }));

    return NextResponse.json({ songs: mockSongs });
  }
}

