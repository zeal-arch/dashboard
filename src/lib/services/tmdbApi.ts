import { ContentItem } from "../store/contentSlice";

export async function fetchTrendingMovies(historyId?: string): Promise<ContentItem[]> {
  try {
    const url = historyId ? `/api/movies?historyId=${historyId}` : '/api/movies';
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("TMDB API error");
    }
    const data = await response.json();
    
    return (data.results || []).map((movie: { id: string, title?: string, original_title?: string, overview: string, poster_path: string, release_date?: string }) => ({
      id: `tmdb-${movie.id}`,
      type: "movie",
      title: movie.title || movie.original_title,
      description: movie.overview,
      image: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80',
      url: `https://www.themoviedb.org/movie/${movie.id}`,
      source: historyId ? "TMDB Recommendations" : "TMDB Trending",
      publishedAt: new Date(movie.release_date || Date.now()).toISOString(),
      category: "entertainment",
    }));
  } catch {
    return [];
  }
}
