/**
 * storage.js
 * Persists full normalised movie objects in localStorage so that the
 * Favorites page can work entirely offline — no extra API calls needed.
 */

const KEY = 'mdh_favorites';

/**
 * Return all saved favourite movie objects.
 * @returns {object[]}
 */
export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}

/**
 * Check whether a movie is currently saved as a favourite.
 * @param {string} id  IMDB ID
 * @returns {boolean}
 */
export function isFavorite(id) {
  return getFavorites().some(m => m.id === id);
}

/**
 * Save a full movie object to favourites (no-op if already saved).
 * @param {object} movie  normalised movie object
 */
export function addFavorite(movie) {
  const favs = getFavorites();
  if (!favs.some(m => m.id === movie.id)) {
    favs.push(movie);
    localStorage.setItem(KEY, JSON.stringify(favs));
  }
}

/**
 * Remove a movie from favourites by IMDB ID.
 * @param {string} id
 */
export function removeFavorite(id) {
  const favs = getFavorites().filter(m => m.id !== id);
  localStorage.setItem(KEY, JSON.stringify(favs));
}

/**
 * Toggle favourite status for a movie.
 * @param {object} movie  normalised movie object (needs full data to save)
 * @returns {boolean}  true if now a favourite, false if removed
 */
export function toggleFavorite(movie) {
  if (isFavorite(movie.id)) {
    removeFavorite(movie.id);
    return false;
  }
  addFavorite(movie);
  return true;
}
