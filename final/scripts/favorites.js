

import { getFavorites, toggleFavorite } from './storage.js';
import { renderMovies, syncFavButton } from './render.js';
import { initModal, openModal } from './modal.js';


// DOM refs
const grid       = document.getElementById('favorites-grid');
const countEl    = document.getElementById('fav-count');
const pluralEl   = document.getElementById('fav-plural');
const emptyState = document.getElementById('empty-state');

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

if (countEl && pluralEl) {
  new MutationObserver(() => {
    pluralEl.textContent = countEl.textContent === '1' ? '' : 's';
  }).observe(countEl, { childList: true, characterData: true, subtree: true });
}

function render() {
  const favMovies = getFavorites();

  if (countEl) countEl.textContent = favMovies.length;

  if (!favMovies.length) {
    if (grid) grid.innerHTML = '';
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  renderMovies(favMovies, grid, {
    onDetails: (movie) => openModal(movie),

    onFavToggle: (movie, btn) => {
      const nowFav = toggleFavorite(movie);

      if (!nowFav) {
        btn.closest('.card-wrapper')?.remove();
        if (!getFavorites().length) {
          if (grid) grid.innerHTML = '';
          if (emptyState) emptyState.hidden = false;
        }
        if (countEl) countEl.textContent = getFavorites().length;
      } else {
        syncFavButton(btn, true);
      }

      const modalBtn = document.querySelector('.btn-fav-modal');
      if (modalBtn && document.getElementById('modal-title')?.textContent === movie.title) {
        modalBtn.classList.toggle('is-favorite', nowFav);
        modalBtn.innerHTML = nowFav ? '&#9829; Remove from Favorites' : '&#9825; Save to Favorites';
      }
    },
  });
}

initModal((id, nowFav) => {
  if (!nowFav) {
    document.querySelector(`.card-wrapper:has([data-id="${id}"])`)?.remove();
    render();
  }
});



render();
