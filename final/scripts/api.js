/**
 * api.js
 * All OMDB API communication lives here.
 * Every function returns a normalised movie object (or array of them)
 * so the rest of the app never has to deal with raw OMDB field names.
 */

const API_KEY  = '64bca8ea';
const BASE_URL = 'http://www.omdbapi.com/';

/**
 * A curated set of well-known IMDB IDs shown on the home page.
 * These are fetched in parallel and the first one becomes the featured film.
 */
const PRESET_IDS = [
  'tt1375666', // Inception (2010)
  'tt0468569', // The Dark Knight (2008)
  'tt0816692', // Interstellar (2014)
  'tt7286456', // Joker (2019)
  'tt6751668', // Parasite (2019)
  'tt4154796', // Avengers: Endgame (2019)
  'tt3783958', // La La Land (2016)
  'tt2380307', // Coco (2017)
];

// ── Normalise ─────────────────────────────────────────────────────────────────

/**
 * Convert a raw OMDB response object into our internal movie shape.
 * Works for both search-result stubs and full detail responses.
 * @param {object} raw  — raw OMDB object
 * @returns {object}
 */
function normalizeMovie(raw) {
  const na = (v) => (!v || v === 'N/A' ? null : v);

  const rating = na(raw.imdbRating);
  const genres = na(raw.Genre)
    ? raw.Genre.split(', ').map(g => g.trim())
    : [];

  return {
    id:       raw.imdbID,
    title:    raw.Title    ?? 'Unknown Title',
    year:     raw.Year     ?? '—',
    rating:   rating ? parseFloat(rating) : null,
    genres,
    overview: na(raw.Plot)     ?? '',
    poster:   na(raw.Poster)
      ?? `https://placehold.co/300x450/0f172a/f59e0b?text=${encodeURIComponent(raw.Title ?? 'Movie')}`,
    director: na(raw.Director) ?? null,
    actors:   na(raw.Actors)   ?? null,
    runtime:  na(raw.Runtime)  ?? null,
    rated:    na(raw.Rated)    ?? null,
    type:     raw.Type         ?? 'movie',
  };
}

// ── API helpers ───────────────────────────────────────────────────────────────

/**
 * Low-level fetch wrapper with error handling.
 * @param {string} params  — URL query string (without leading ?)
 */
async function omdbFetch(params) {
  const url = `${BASE_URL}?${params}&apikey=${API_KEY}`;
  const res  = await fetch(url);
  if (!res.ok) throw new Error(`Network error: ${res.status}`);
  const data = await res.json();
  if (data.Response === 'False') throw new Error(data.Error ?? 'OMDB returned no results');
  return data;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch full details for a single movie by IMDB ID.
 * @param {string} imdbId  e.g. 'tt1375666'
 * @returns {Promise<object>}  normalised movie
 */
export async function fetchMovieDetails(imdbId) {
  const data = await omdbFetch(`i=${encodeURIComponent(imdbId)}&plot=full`);
  return normalizeMovie(data);
}

/**
 * Fetch the preset list of movies for the home page (runs in parallel).
 * @returns {Promise<object[]>}  normalised movies
 */
export async function fetchPresetMovies() {
  const results = await Promise.allSettled(
    PRESET_IDS.map(id => fetchMovieDetails(id))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}

/**
 * Search movies by title keyword.
 * Returns normalised stubs (no overview / director / actors — those need fetchMovieDetails).
 * @param {string} query
 * @param {number} [page=1]   OMDB page (1–100, 10 results per page)
 * @returns {Promise<object[]>}
 */
export async function searchMovies(query, page = 1) {
  if (!query.trim()) return [];
  const data = await omdbFetch(
    `s=${encodeURIComponent(query.trim())}&type=movie&page=${page}`
  );
  return (data.Search ?? []).map(normalizeMovie);
}

/**
 * Fetch the latest movies for the default Movies page view.
 * Uses a broad search term filtered to the current year; falls back
 * to the previous year if OMDB has no results yet for this year.
 * @returns {Promise<object[]>}
 */
export async function fetchLatestMovies() {
  const year = new Date().getFullYear();

  // Broad terms in parallel — each can return up to 10 results.
  // Five terms × 10 = up to 50 raw results; after dedup easily clears 15+.
  const terms = ['the', 'love', 'dark', 'night', 'war'];
  for (const y of [year, year - 1]) {
    try {
      const sets = await Promise.allSettled(
        terms.map(t => omdbFetch(`s=${t}&type=movie&y=${y}`))
      );
      const movies = sets
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value.Search ?? [])
        .map(normalizeMovie);

      // Deduplicate by id
      const seen = new Set();
      const unique = movies.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      if (unique.length) return unique;
    } catch {
      // continue to next year
    }
  }
  return [];
}
