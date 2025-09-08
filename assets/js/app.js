// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('site-nav');
if (toggle && nav) {
toggle.addEventListener('click', () => {
const expanded = toggle.getAttribute('aria-expanded') === 'true';
toggle.setAttribute('aria-expanded', String(!expanded));
nav.classList.toggle('open');
});
}

// Year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Scroll reveal
const observer = new IntersectionObserver((entries) => {
entries.forEach(e => {
if (e.isIntersecting) {
e.target.classList.add('visible');
observer.unobserve(e.target);
}
})
}, { threshold: 0.18 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// Instagram link placeholder — mettez ici l'URL Instagram quand vous l'aurez
const instaUrl = ""; // <-- REMPLACEZ par l'URL officielle Instagram quand vous l'aurez
['instaLink', 'instaLink2', 'instaLink3'].forEach(id => {
const a = document.getElementById(id);
if (a) {
if (instaUrl) {
a.href = instaUrl;
} else {
a.addEventListener('click', (ev) => {
ev.preventDefault();
alert("Le lien Instagram sera ajouté prochainement.");
});
}
}
});