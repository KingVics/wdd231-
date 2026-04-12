/**
 * main.js — Home page
 * Fetches the preset list of movies from OMDB, renders the featured panel,
 * and populates the trending grid.
 */

import { fetchPresetMovies } from './api.js';
import { renderMovies, syncFavButton } from './render.js';
import { toggleFavorite } from './storage.js';
import { initModal, openModal } from './modal.js';

// ── Hamburger nav ──────────────────────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open', !expanded);
});

// ── Featured panel ─────────────────────────────────────────────────────────────
function renderFeatured(movie) {
  const poster   = document.getElementById('featured-poster');
  const title    = document.getElementById('featured-title');
  const meta     = document.getElementById('featured-meta');
  const overview = document.getElementById('featured-overview');
  const btn      = document.getElementById('featured-btn');

  if (poster) { poster.src = movie.poster; poster.alt = `${movie.title} poster`; }

  if (title)   title.textContent = movie.title;

  if (meta) {
    const parts = [movie.year];
    if (movie.rating != null) parts.push(`★ ${movie.rating.toFixed(1)}`);
    if (movie.genres.length)  parts.push(movie.genres.slice(0, 2).join(', '));
    meta.textContent = parts.join('  ·  ');
  }

  if (overview) overview.textContent = movie.overview || 'No overview available.';

  if (btn) {
    btn.addEventListener('click', () => openModal(movie));
  }
}

// ── Trending grid ──────────────────────────────────────────────────────────────
function renderTrending(movies) {
  const container = document.getElementById('trending-grid');
  if (!container) return;

  renderMovies(movies, container, {
    onDetails: (movie) => openModal(movie),
    onFavToggle: (movie, btn) => {
      const nowFav = toggleFavorite(movie);
      syncFavButton(btn, nowFav);
      // Keep modal fav button in sync if the same movie is open
      const modalBtn = document.querySelector('.btn-fav-modal');
      if (modalBtn && document.querySelector(`#modal-title`)?.textContent === movie.title) {
        modalBtn.classList.toggle('is-favorite', nowFav);
        modalBtn.innerHTML = nowFav ? '&#9829; Remove from Favorites' : '&#9825; Save to Favorites';
      }
    },
  });
}

// ── Init ───────────────────────────────────────────────────────────────────────
initModal((id, nowFav) => {
  // Sync any card on this page that belongs to the toggled movie
  document.querySelectorAll(`.btn-fav[data-id="${id}"]`).forEach(btn => {
    syncFavButton(btn, nowFav);
  });
});

(async () => {
  const grid = document.getElementById('trending-grid');
  try {
    const movies = await fetchPresetMovies();
    if (!movies.length) throw new Error('No movies returned');

    renderFeatured(movies[0]);
    renderTrending(movies.slice(1));   // show the rest in the trending grid
  } catch (err) {
    console.error(err);
    if (grid) grid.innerHTML = '<p class="state-message">Could not load movies. Check your connection.</p>';
  }
})();
