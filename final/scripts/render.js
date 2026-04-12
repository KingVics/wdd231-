

import { isFavorite } from './storage.js';


export function createMovieCard(movie, { onDetails, onFavToggle } = {}) {
  const fav    = isFavorite(movie.id);
  const rating = movie.rating != null ? `&#9733; ${movie.rating.toFixed(1)}` : '&#9733; —';

  const genreHTML = movie.genres.length
    ? movie.genres.map(g => `<span class="genre-badge">${g}</span>`).join('')
    : '<span class="genre-badge">—</span>';

  const wrapper = document.createElement('div');
  wrapper.className = 'card-wrapper';

  const article = document.createElement('article');
  article.className = 'movie-card';
  article.dataset.id = movie.id;

  article.innerHTML = `
    <img
      class="card-poster"
      src="${movie.poster}"
      alt="${movie.title} poster"
      loading="lazy"
      width="300"
      height="450"
    >
    <div class="card-body">
      <div class="card-meta">
        <span class="card-rating">${rating}</span>
        <span class="card-year">${movie.year}</span>
      </div>
      <h3 class="card-title">${movie.title}</h3>
      <div class="card-genres">${genreHTML}</div>
      <div class="card-actions">
        <button class="btn-details" data-id="${movie.id}">Details</button>
        <button
          class="btn-fav${fav ? ' is-favorite' : ''}"
          data-id="${movie.id}"
          aria-label="${fav ? 'Remove from favorites' : 'Add to favorites'}"
          title="${fav ? 'Remove from favorites' : 'Save to favorites'}"
        >${fav ? '&#9829;' : '&#9825;'}</button>
      </div>
    </div>
  `;

  article.querySelector('.btn-details').addEventListener('click', () => {
    onDetails?.(movie);
  });

  article.querySelector('.btn-fav').addEventListener('click', (e) => {
    onFavToggle?.(movie, e.currentTarget);
  });

  wrapper.appendChild(article);
  return wrapper;
}


export function renderMovies(movies, container, callbacks = {}) {
  container.innerHTML = '';

  if (!movies.length) {
    container.innerHTML = '<p class="state-message">No movies found.</p>';
    return;
  }

  const fragment = document.createDocumentFragment();
  movies.forEach(m => fragment.appendChild(createMovieCard(m, callbacks)));
  container.appendChild(fragment);
}


export function syncFavButton(btn, nowFav) {
  btn.classList.toggle('is-favorite', nowFav);
  btn.innerHTML = nowFav ? '&#9829;' : '&#9825;';
  btn.setAttribute('aria-label', nowFav ? 'Remove from favorites' : 'Add to favorites');
  btn.setAttribute('title',      nowFav ? 'Remove from favorites' : 'Save to favorites');
}
