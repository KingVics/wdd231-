

document.getElementById('year').textContent = new Date().getFullYear();



// Form validation: highlight invalid fields red on submit attempt
const form = document.getElementById('suggest-form');

form.addEventListener('submit', (e) => {
  if (!form.checkValidity()) {
    e.preventDefault();
    form.querySelectorAll(':invalid').forEach(el => {
      el.classList.add('field-error');
    });
  }
});

// Clear error styling as user corrects each field
form.querySelectorAll('.form-control').forEach(el => {
  el.addEventListener('input', () => {
    el.classList.toggle('field-error', !el.validity.valid);
  });
});


