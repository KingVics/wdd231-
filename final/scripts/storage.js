
const KEY = 'mdh_favorites';


export function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) ?? [];
  } catch {
    return [];
  }
}


export function isFavorite(id) {
  return getFavorites().some(m => m.id === id);
}

export function addFavorite(movie) {
  const favs = getFavorites();
  if (!favs.some(m => m.id === movie.id)) {
    favs.push(movie);
    localStorage.setItem(KEY, JSON.stringify(favs));
  }
}


export function removeFavorite(id) {
  const favs = getFavorites().filter(m => m.id !== id);
  localStorage.setItem(KEY, JSON.stringify(favs));
}


export function toggleFavorite(movie) {
  if (isFavorite(movie.id)) {
    removeFavorite(movie.id);
    return false;
  }
  addFavorite(movie);
  return true;
}
