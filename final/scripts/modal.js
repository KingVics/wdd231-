/**
 * modal.js
 * Manages the single shared movie-detail modal dialog.
 * Stores the current movie in a module-level variable so the
 * favourite toggle inside the modal has access to the full object.
 */

import { isFavorite, toggleFavorite } from './storage.js';
import { syncFavButton } from './render.js';

let overlay         = null;
let currentMovie    = null;
let onFavChangeCb   = null;

// ── Setup ─────────────────────────────────────────────────────────────────────

/**
 * Inject the modal markup once and wire all static event listeners.
 * @param {Function} [onFavChange]  called with (movieId, nowFav) after a toggle
 */
export function initModal(onFavChange) {
  onFavChangeCb = onFavChange;

  overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', 'modal-title');

  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title"></h2>
        <button class="modal-close" aria-label="Close dialog">&#10005;</button>
      </div>
      <div class="modal-body">
        <img class="modal-poster" src="" alt="" width="300" height="450">

        <div class="modal-meta">
          <div class="modal-meta-item">
            <span class="modal-meta-label">Year</span>
            <span class="modal-meta-value" id="m-year"></span>
          </div>
          <div class="modal-meta-item">
            <span class="modal-meta-label">Rating</span>
            <span class="modal-meta-value rating" id="m-rating"></span>
          </div>
          <div class="modal-meta-item" id="m-runtime-wrap">
            <span class="modal-meta-label">Runtime</span>
            <span class="modal-meta-value" id="m-runtime"></span>
          </div>
          <div class="modal-meta-item" id="m-rated-wrap">
            <span class="modal-meta-label">Rated</span>
            <span class="modal-meta-value" id="m-rated"></span>
          </div>
        </div>

        <p class="modal-overview" id="m-overview"></p>

        <div class="modal-genres" id="m-genres"></div>

        <div id="m-crew" style="font-size:0.9rem; color:#4b5563; line-height:1.6;"></div>

        <div class="modal-actions">
          <button class="btn-fav-modal">&#9825; Save to Favorites</button>
          <button class="btn-close-modal">Close</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on backdrop click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.querySelector('.btn-close-modal').addEventListener('click', closeModal);

  // Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  // Favourite toggle
  overlay.querySelector('.btn-fav-modal').addEventListener('click', (e) => {
    if (!currentMovie) return;
    const nowFav = toggleFavorite(currentMovie);
    updateModalFavBtn(e.currentTarget, nowFav);
    onFavChangeCb?.(currentMovie.id, nowFav);
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function updateModalFavBtn(btn, nowFav) {
  btn.classList.toggle('is-favorite', nowFav);
  btn.innerHTML = nowFav ? '&#9829; Remove from Favorites' : '&#9825; Save to Favorites';
}

function setText(id, value, fallback = '—') {
  const el = overlay.querySelector(`#${id}`);
  if (el) el.textContent = value || fallback;
}

function showWrap(id, value) {
  const el = overlay.querySelector(`#${id}`);
  if (el) el.hidden = !value;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Populate and open the modal with a (fully-detailed) movie object.
 * @param {object} movie  normalised movie from api.js
 */
export function openModal(movie) {
  if (!overlay) initModal();
  currentMovie = movie;

  // Title
  overlay.querySelector('.modal-title').textContent = movie.title;

  // Poster
  const poster = overlay.querySelector('.modal-poster');
  poster.src = movie.poster;
  poster.alt = `${movie.title} poster`;

  // Meta fields
  setText('m-year',    movie.year);
  setText('m-rating',  movie.rating != null ? `★ ${movie.rating.toFixed(1)}` : null);
  setText('m-runtime', movie.runtime);
  setText('m-rated',   movie.rated);
  showWrap('m-runtime-wrap', movie.runtime);
  showWrap('m-rated-wrap',   movie.rated);

  // Overview
  setText('m-overview', movie.overview, 'No overview available.');

  // Genres
  const genresEl = overlay.querySelector('#m-genres');
  genresEl.innerHTML = movie.genres.length
    ? movie.genres.map(g => `<span class="genre-badge">${g}</span>`).join('')
    : '';

  // Director / Actors
  const crewEl = overlay.querySelector('#m-crew');
  const crewLines = [];
  if (movie.director) crewLines.push(`<strong>Director:</strong> ${movie.director}`);
  if (movie.actors)   crewLines.push(`<strong>Cast:</strong> ${movie.actors}`);
  crewEl.innerHTML = crewLines.join('<br>');

  // Favourite button
  updateModalFavBtn(overlay.querySelector('.btn-fav-modal'), isFavorite(movie.id));

  // Open
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  overlay.querySelector('.modal-close').focus();
}

/**
 * Close and reset the modal.
 */
export function closeModal() {
  overlay?.classList.remove('open');
  document.body.style.overflow = '';
  currentMovie = null;
}
