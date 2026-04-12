

import { searchMovies, fetchMovieDetails, fetchLatestMovies } from './api.js';
import { renderMovies, syncFavButton } from './render.js';
import { toggleFavorite } from './storage.js';
import { initModal, openModal } from './modal.js';

//  Hamburger nav 
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open', !expanded);
});

// DOM refs
const grid        = document.getElementById('movies-grid');
const searchInput = document.getElementById('search-input');
const filterBar   = document.getElementById('filter-bar');
const countEl     = document.getElementById('movies-count');


const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy',
  'Crime',  'Drama',     'Horror',    'Romance',
  'Sci-Fi', 'Thriller',
];

function buildFilterBar() {
  GENRES.forEach(genre => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn';
    btn.textContent = genre;
    btn.addEventListener('click', () => {
      filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      searchInput.value = genre;
      runSearch(genre);
    });
    filterBar.appendChild(btn);
  });
}

// Search
let debounceTimer;

searchInput?.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    runSearch(searchInput.value);
  }, 400);
});

async function runSearch(query) {
  if (!grid) return;

  if (!query.trim()) {
    grid.innerHTML = '<p class="state-message">Type a title or pick a genre above to browse movies.</p>';
    if (countEl) countEl.textContent = '0 movies';
    return;
  }

  grid.innerHTML = '<p class="state-message">Searching…</p>';

  try {
    const movies = await searchMovies(query);
    if (countEl) countEl.textContent = `${movies.length} movie${movies.length !== 1 ? 's' : ''}`;

    renderMovies(movies, grid, {
      onDetails: async (movie) => {
        try {
          const full = await fetchMovieDetails(movie.id);
          openModal(full);
        } catch {
          openModal(movie); 
        }
      },
      onFavToggle: (movie, btn) => {
        const nowFav = toggleFavorite(movie);
        syncFavButton(btn, nowFav);
        const modalBtn = document.querySelector('.btn-fav-modal');
        if (modalBtn && document.getElementById('modal-title')?.textContent === movie.title) {
          modalBtn.classList.toggle('is-favorite', nowFav);
          modalBtn.innerHTML = nowFav ? '&#9829; Remove from Favorites' : '&#9825; Save to Favorites';
        }
      },
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="state-message">No results found. Try a different search term.</p>';
    if (countEl) countEl.textContent = '0 movies';
  }
}

//  Initialization
initModal((id, nowFav) => {
  document.querySelectorAll(`.btn-fav[data-id="${id}"]`).forEach(btn => {
    syncFavButton(btn, nowFav);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();

buildFilterBar();

(async () => {
  grid.innerHTML = '<p class="state-message">Loading latest movies…</p>';
  try {
    const movies = await fetchLatestMovies();
    if (countEl) countEl.textContent = `${movies.length} movie${movies.length !== 1 ? 's' : ''}`;
    renderMovies(movies, grid, {
      onDetails: async (movie) => {
        try {
          const full = await fetchMovieDetails(movie.id);
          openModal(full);
        } catch {
          openModal(movie);
        }
      },
      onFavToggle: (movie, btn) => {
        const nowFav = toggleFavorite(movie);
        syncFavButton(btn, nowFav);
        const modalBtn = document.querySelector('.btn-fav-modal');
        if (modalBtn && document.getElementById('modal-title')?.textContent === movie.title) {
          modalBtn.classList.toggle('is-favorite', nowFav);
          modalBtn.innerHTML = nowFav ? '&#9829; Remove from Favorites' : '&#9825; Save to Favorites';
        }
      },
    });
  } catch (err) {
    console.error(err);
    grid.innerHTML = '<p class="state-message">Could not load movies. Check your connection.</p>';
  }
})();
