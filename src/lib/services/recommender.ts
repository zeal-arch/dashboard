/**
 * Lightweight Content-Based Recommender
 *
 * Implements TF-IDF vectorization + Cosine Similarity to rank a pool of
 * candidate items against a "user profile" built from their favorites.
 *
 * Algorithm (same core as ts-content-based-recommender, but zero npm deps):
 *  1. Tokenize & clean text (title + description) for every item.
 *  2. Build a TF-IDF vector for each item over the combined corpus.
 *  3. Build a "user profile vector" by averaging the TF-IDF vectors of favorites.
 *  4. Rank candidates by cosine similarity to the user profile.
 *  5. Boost items that share a category/type with recently favorited items.
 */

// ── 1. Text helpers ───────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with",
  "is","it","its","this","that","was","are","be","been","has","had","have",
  "not","from","by","as","he","she","they","we","you","i","my","our","your",
  "about","after","also","all","more","than","up","if","so","do","did",
  "will","can","just","into","over","new","one","two","no","may","how",
]);

function tokenize(text: string): string[] {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

// ── 2. TF-IDF ─────────────────────────────────────────────────────────────────

function termFrequency(tokens: string[]): Record<string, number> {
  const tf: Record<string, number> = {};
  for (const t of tokens) tf[t] = (tf[t] || 0) + 1;
  const total = tokens.length || 1;
  for (const t in tf) tf[t] /= total;
  return tf;
}

function buildIDF(tokensList: string[][]): Record<string, number> {
  const docCount = tokensList.length;
  const df: Record<string, number> = {};
  for (const tokens of tokensList) {
    for (const t of new Set(tokens)) df[t] = (df[t] || 0) + 1;
  }
  const idf: Record<string, number> = {};
  for (const t in df) idf[t] = Math.log((docCount + 1) / (df[t] + 1)) + 1;
  return idf;
}

function tfidfVector(tf: Record<string, number>, idf: Record<string, number>): Record<string, number> {
  const v: Record<string, number> = {};
  for (const t in tf) v[t] = tf[t] * (idf[t] || 1);
  return v;
}

// ── 3. Cosine Similarity ──────────────────────────────────────────────────────

function cosineSimilarity(a: Record<string, number>, b: Record<string, number>): number {
  let dot = 0, normA = 0, normB = 0;
  for (const t in a) {
    dot += a[t] * (b[t] || 0);
    normA += a[t] ** 2;
  }
  for (const t in b) normB += b[t] ** 2;
  return normA && normB ? dot / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
}

// ── 4. Public API ─────────────────────────────────────────────────────────────

export interface RecommenderItem {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  isRecommendation?: boolean;
}

/**
 * Ranks `candidates` by similarity to the user's `favorites`.
 * Returns at most `maxResults` items, ordered highest-similarity first.
 *
 * @param favorites - Items the user has already liked/saved.
 * @param candidates - Pool of recommendation-eligible items to rank.
 * @param maxResults - Maximum number of results to return (default 8).
 */
export function rankRecommendations<T extends RecommenderItem>(
  favorites: T[],
  candidates: T[],
  maxResults = 8,
): T[] {
  // No favorites → return a random sample of candidates
  if (favorites.length === 0) {
    return [...candidates].sort(() => Math.random() - 0.5).slice(0, maxResults);
  }

  const allItems = [...favorites, ...candidates];
  const tokensList = allItems.map((i) => tokenize(`${i.title} ${i.description}`));
  const idf = buildIDF(tokensList);

  const favoriteVectors = favorites.map((_, idx) => {
    const tf = termFrequency(tokensList[idx]);
    return tfidfVector(tf, idf);
  });

  // Build user profile = average of favorite vectors
  const profile: Record<string, number> = {};
  for (const vec of favoriteVectors) {
    for (const t in vec) profile[t] = (profile[t] || 0) + vec[t] / favoriteVectors.length;
  }

  // Collect the types and categories from favorites for genre boosting
  const favoriteTypes = new Set(favorites.map((i) => i.type));
  const favoriteCategories = new Set(favorites.map((i) => i.category));

  const scored = candidates.map((item, i) => {
    const tf = termFrequency(tokensList[favorites.length + i]);
    const vec = tfidfVector(tf, idf);
    let score = cosineSimilarity(profile, vec);

    // Genre boost: +20% if the item shares a type or category with favorites
    if (favoriteTypes.has(item.type) || favoriteCategories.has(item.category)) {
      score *= 1.2;
    }

    return { item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map((s) => s.item);
}
