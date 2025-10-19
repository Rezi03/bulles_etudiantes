// Attend que le contenu de la page soit chargé pour exécuter les scripts
document.addEventListener('DOMContentLoaded', () => {

    // --- GESTION DU MENU MOBILE ---
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const open = nav.classList.toggle('open');
            toggle.setAttribute('aria-expanded', String(open));
        });
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                nav.classList.remove('open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // --- MISE À JOUR DE L'ANNÉE DANS LE FOOTER ---
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // --- ANIMATIONS AU DÉFILEMENT (SCROLL REVEAL) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                observer.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

    // --- RÉCUPÉRATION DES 4 DERNIERS ÉPISODES ---
    const fetchLatestEpisodes = async () => {
        const EPISODES_CONTAINER = document.getElementById('episodes-list');
        if (!EPISODES_CONTAINER) return;

        const RSS_FEED_URL = "https://www.rcf.fr/feed/show/2934";
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;

        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();

            if (data.status !== 'ok' || !data.items || data.items.length === 0) {
                throw new Error("Flux RSS non valide ou vide.");
            }

            const latestEpisodes = data.items.slice(0, 4); // On prend les 4 premiers
            
            const episodesHtml = latestEpisodes.map(episode => {
                const title = episode.title;
                const audioUrl = episode.enclosure.link;
                const pubDate = new Date(episode.pubDate).toLocaleDateString('fr-FR', {
                    year: 'numeric', month: 'long', day: 'numeric'
                });

                return `
                    <div class="episode-meta">
                        <h3>${title}</h3>
                        <span class="date">Diffusé le ${pubDate}</span>
                        <audio controls preload="metadata" title="${title}">
                            <source src="${audioUrl}" type="audio/mpeg">
                            Votre navigateur ne supporte pas le lecteur audio.
                        </audio>
                    </div>
                `;
            }).join('');

            EPISODES_CONTAINER.innerHTML = episodesHtml;

        } catch (error) {
            console.error("Échec de la récupération des épisodes :", error);
            EPISODES_CONTAINER.innerHTML = `<p class="muted">Impossible de charger les épisodes pour le moment. Veuillez consulter directement le site de <a href="https://www.rcf.fr/culture/bulles-etudiantes" target="_blank">RCF</a>.</p>`;
        }
    };
    fetchLatestEpisodes();

    // --- LIEN INSTAGRAM ---
    const instaUrl = "https://www.instagram.com/bullesetudiantes/"; // <-- METTEZ VOTRE VRAI LIEN ICI
    document.querySelectorAll('#instaLink').forEach(link => {
        if(link) link.href = instaUrl;
    });

    // --- GESTION DU FORMULAIRE DE CONTACT (FORMSPREE) ---
    const form = document.getElementById('contact-form');
    if (form) {
        const status = document.getElementById('form-status');
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            status.textContent = 'Envoi…';
            try {
                const data = new FormData(form);
                const res = await fetch(form.action, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } });
                if (res.ok) {
                    status.textContent = 'Merci ! Votre message a bien été envoyé.';
                    form.reset();
                } else {
                    status.textContent = "Échec de l'envoi. Veuillez réessayer.";
                }
            } catch (err) {
                status.textContent = 'Erreur réseau. Veuillez réessayer.';
            }
        });
    }
    
    // --- GESTION DE LA FENÊTRE MODALE (MENTIONS LÉGALES) ---
    const modalOverlay = document.getElementById('legal-modal');
    const openBtn = document.getElementById('open-legal');
    const closeBtn = document.getElementById('close-legal');

    if (modalOverlay && openBtn && closeBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modalOverlay.classList.add('open');
        });
        closeBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('open');
        });
        // Fermer en cliquant en dehors de la modale
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('open');
            }
        });
    }
});