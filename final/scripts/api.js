

const API_KEY = '64bca8ea';
const BASE_URL = 'https://www.omdbapi.com/';

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


function normalizeMovie(raw) {
  const na = (v) => (!v || v === 'N/A' ? null : v);

  const rating = na(raw.imdbRating);
  const genres = na(raw.Genre)
    ? raw.Genre.split(', ').map(g => g.trim())
    : [];

  return {
    id: raw.imdbID,
    title: raw.Title ?? 'Unknown Title',
    year: raw.Year ?? '—',
    rating: rating ? parseFloat(rating) : null,
    genres,
    overview: na(raw.Plot) ?? '',
    poster: na(raw.Poster)
      ?? `https://placehold.co/300x450/0f172a/f59e0b?text=${encodeURIComponent(raw.Title ?? 'Movie')}`,
    director: na(raw.Director) ?? null,
    actors: na(raw.Actors) ?? null,
    runtime: na(raw.Runtime) ?? null,
    rated: na(raw.Rated) ?? null,
    type: raw.Type ?? 'movie',
  };
}

//  API helpers 
async function omdbFetch(params) {
  try {
    const url = `${BASE_URL}?${params}&apikey=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Network error: ${res.status}`);
    const data = await res.json();
    if (data.Response === 'False') throw new Error(data.Error ?? 'OMDB returned no results');
    return data;
  } catch (error) {
    console.error('Error fetching OMDB data:', error);
    throw error;
  }
}

//  Public API

export async function fetchMovieDetails(imdbId) {
  const data = await omdbFetch(`i=${encodeURIComponent(imdbId)}&plot=full`);
  return normalizeMovie(data);
}


export async function fetchPresetMovies() {
  const results = await Promise.allSettled(
    PRESET_IDS.map(id => fetchMovieDetails(id))
  );
  return results
    .filter(r => r.status === 'fulfilled')
    .map(r => r.value);
}


export async function searchMovies(query, page = 1) {
  if (!query.trim()) return [];
  const data = await omdbFetch(
    `s=${encodeURIComponent(query.trim())}&type=movie&page=${page}`
  );
  return (data.Search ?? []).map(normalizeMovie);
}


export async function fetchLatestMovies() {
  const year = new Date().getFullYear();

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

      const seen = new Set();
      const unique = movies.filter(m => {
        if (seen.has(m.id)) return false;
        seen.add(m.id);
        return true;
      });

      if (unique.length) return unique;
    } catch {
    }
  }
  return [];
}
