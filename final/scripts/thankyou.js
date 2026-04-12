

document.getElementById('year').textContent = new Date().getFullYear();


// Render submitted form data from URL params
const params = new URLSearchParams(window.location.search);

const FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'movie', label: 'Movie' },
  { key: 'year', label: 'Year' },
  { key: 'genre', label: 'Genre' },
  { key: 'rating', label: 'Rating' },
  { key: 'message', label: 'Message' },
];

const STARS = {
  '1': '★ Poor',
  '2': '★★ Fair',
  '3': '★★★ Good',
  '4': '★★★★ Great',
  '5': '★★★★★ Masterpiece',
};

const list = document.getElementById('result-list');

FIELDS.forEach(({ key, label }) => {
  const raw = params.get(key);
  if (!raw) return;
  const value = key === 'rating' ? (STARS[raw] ?? raw) : raw;
  const li = document.createElement('li');
  li.innerHTML = `
    <span class="result-label">${label}</span>
    <span class="result-value">${value}</span>
  `;
  list.appendChild(li);
});

// Fallback when the page is opened directly without form data
if (!list.children.length) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.className = 'result-label';
  span.style.gridColumn = '1 / -1';
  span.innerHTML = 'No submission data found. <a href="suggest.html">Go back to the form.</a>';
  li.appendChild(span);
  list.appendChild(li);
}




