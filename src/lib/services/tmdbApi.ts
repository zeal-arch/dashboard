import { ContentItem } from "../store/contentSlice";

export async function fetchTrendingMovies(historyId?: string, search: string = "", lang: string = "en"): Promise<ContentItem[]> {
  try {
    const url = historyId ? `/api/movies?historyId=${historyId}` : '/api/movies';
    const baseUrl = url.split('?')[0];
    const existingQuery = url.split('?')[1] || '';
    const queryParams = new URLSearchParams(existingQuery);
    if (search) queryParams.append("q", search);
    if (lang) queryParams.append("lang", lang);
    const finalUrl = baseUrl + "?" + queryParams.toString();
    const response = await fetch(finalUrl);
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
