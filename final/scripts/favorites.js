/**
 * favorites.js — Favorites page
 * Reads full movie objects from localStorage — no API calls needed for listing.
 * Full details are already stored when the user saves a movie, so the
 * modal can open immediately without an extra fetch.
 */

import { getFavorites, toggleFavorite } from './storage.js';
import { renderMovies, syncFavButton } from './render.js';
import { initModal, openModal } from './modal.js';

// ── Hamburger nav ──────────────────────────────────────────────────────────────
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
  const expanded = hamburger.getAttribute('aria-expanded') === 'true';
  hamburger.setAttribute('aria-expanded', String(!expanded));
  navLinks.classList.toggle('open', !expanded);
});

// ── DOM refs ───────────────────────────────────────────────────────────────────
const grid       = document.getElementById('favorites-grid');
const countEl    = document.getElementById('fav-count');
const emptyState = document.getElementById('empty-state');

// ── Render ─────────────────────────────────────────────────────────────────────
function render() {
  const favMovies = getFavorites();

  if (countEl) countEl.textContent = favMovies.length;

  if (!favMovies.length) {
    if (grid)       grid.innerHTML = '';
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  renderMovies(favMovies, grid, {
    // All favorites are full objects — open modal directly
    onDetails: (movie) => openModal(movie),

    onFavToggle: (movie, btn) => {
      const nowFav = toggleFavorite(movie);

      if (!nowFav) {
        // Remove card from grid immediately
        btn.closest('.card-wrapper')?.remove();
        // Re-check empty state
        if (!getFavorites().length) {
          if (grid)       grid.innerHTML = '';
          if (emptyState) emptyState.hidden = false;
        }
        if (countEl) countEl.textContent = getFavorites().length;
      } else {
        syncFavButton(btn, true);
      }

      // Sync modal button if open on this movie
      const modalBtn = document.querySelector('.btn-fav-modal');
      if (modalBtn && document.getElementById('modal-title')?.textContent === movie.title) {
        modalBtn.classList.toggle('is-favorite', nowFav);
        modalBtn.innerHTML = nowFav ? '&#9829; Remove from Favorites' : '&#9825; Save to Favorites';
      }
    },
  });
}

// ── Init ───────────────────────────────────────────────────────────────────────
initModal((id, nowFav) => {
  if (!nowFav) {
    // Movie was unfavorited from inside the modal — remove its card
    document.querySelector(`.card-wrapper:has([data-id="${id}"])`)?.remove();
    render(); // recalculate count and empty state
  }
});

render();
