// ============================================================
//  Navigation
// ============================================================
const menuToggle = document.getElementById('menuToggle');
const mainNav = document.getElementById('mainNav');

menuToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', isOpen.toString());
});

// ============================================================
// Footer: Dynamic Copyright Year
// ============================================================
const copyrightEl = document.getElementById('copyright');
if (copyrightEl) {
    copyrightEl.innerHTML = `&copy; ${new Date().getFullYear()} &bull; Check Your Understanding &bull; Víctor García &bull; Spain`;
}

// ============================================================
// Footer: Last Modified Date
// ============================================================
const lastModifiedEl = document.getElementById('lastModified');
if (lastModifiedEl) {
    lastModifiedEl.innerHTML = `Last Modification: ${document.lastModified}`;
}

// ============================================================
// Course Data
// ============================================================
const courses = [
    {
        subject: 'CSE',
        number: 110,
        title: 'Introduction to Programming',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'Introduction to programming concepts.',
        technology: ['Python'],
        completed: true,
    },
    {
        subject: 'WDD',
        number: 130,
        title: 'Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'Introduction to HTML, CSS, and web development.',
        technology: ['HTML', 'CSS'],
        completed: true,
    },
    {
        subject: 'CSE',
        number: 111,
        title: 'Programming with Functions',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'Functional programming with Python.',
        technology: ['Python'],
        completed: true,
    },
    {
        subject: 'CSE',
        number: 210,
        title: 'Programming with Classes',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'Object-oriented programming with C#.',
        technology: ['C#'],
        completed: false,
    },
    {
        subject: 'WDD',
        number: 131,
        title: 'Dynamic Web Fundamentals',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'JavaScript for dynamic web pages.',
        technology: ['HTML', 'CSS', 'JavaScript'],
        completed: true,
    },
    {
        subject: 'WDD',
        number: 231,
        title: 'Frontend Web Development I',
        credits: 2,
        certificate: 'Web and Computer Programming',
        description: 'Advanced frontend development.',
        technology: ['HTML', 'CSS', 'JavaScript'],
        completed: false,
    },
];

// ============================================================
// Course Display
// ============================================================
const courseList = document.getElementById('courseList');
const totalCreditsEl = document.getElementById('totalCredits');
const filterBtns = document.querySelectorAll('.filter-btn');

let currentFilter = 'all';

function renderCourses(filter) {
    const filtered = filter === 'all'
        ? courses
        : courses.filter(c => c.subject === filter);

    courseList.innerHTML = filtered.map(course => `
    <div class="course-card ${course.completed ? 'completed' : 'incomplete'}">
      ${course.subject} ${course.number}
    </div>
  `).join('');

    const totalCredits = filtered.reduce((sum, c) => sum + c.credits, 0);
    totalCreditsEl.textContent = totalCredits;
}

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderCourses(currentFilter);
    });
});

// Initial render
renderCourses('all');