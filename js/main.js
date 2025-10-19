document.addEventListener('DOMContentLoaded', () => {

    // **** NOUVELLE FONCTION POUR TRIER LE PLANNING EN DEUX TABLEAUX ****
    const sortAndSplitPlanningTable = () => {
        const sourceTable = document.getElementById('planning-source-table');
        const upcomingBody = document.getElementById('upcoming-sessions-body');
        const pastBody = document.getElementById('past-sessions-body');

        // Si on n'est pas sur la page planning, on arrête la fonction.
        if (!sourceTable || !upcomingBody || !pastBody) return;

        const rows = Array.from(sourceTable.querySelectorAll('tbody tr'));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Important pour comparer les jours correctement

        rows.forEach(row => {
            const dateCell = row.querySelector('td');
            if (!dateCell) return;

            // Convertit le texte "JJ/MM/AAAA" en un objet Date
            const dateText = dateCell.textContent.trim();
            const dateParts = dateText.split('/');
            const sessionDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

            // Compare la date de la session avec aujourd'hui et place la ligne
            if (sessionDate < today) {
                pastBody.appendChild(row); // Met la ligne dans le tableau "Sessions closes"
            } else {
                upcomingBody.appendChild(row); // Met la ligne dans le tableau "Sessions à venir"
            }
        });
    };

    // --- LE RESTE DE VOTRE FICHIER JS (INCHANGÉ) ---
    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };
    const initCustomPlayers = () => {
        document.querySelectorAll('.episode-meta').forEach(episodeCard => {
            const audio = episodeCard.querySelector('audio');
            const playPauseBtn = episodeCard.querySelector('.play-pause-btn');
            const progressBar = episodeCard.querySelector('.progress-bar');
            const progressBarContainer = episodeCard.querySelector('.progress-bar-container');
            const timeDisplay = episodeCard.querySelector('.time-display');
            const skipAdBtn = episodeCard.querySelector('.skip-ad-btn');

            playPauseBtn.addEventListener('click', () => {
                if (audio.paused) {
                    document.querySelectorAll('audio').forEach(otherAudio => { if (otherAudio !== audio) otherAudio.pause(); });
                    audio.play();
                } else {
                    audio.pause();
                }
            });

            audio.addEventListener('play', () => playPauseBtn.classList.add('playing'));
            audio.addEventListener('pause', () => {
                playPauseBtn.classList.remove('playing');
                document.querySelectorAll('.play-pause-btn').forEach(btn => { if(btn !== playPauseBtn) btn.classList.remove('playing'); });
            });

            audio.addEventListener('timeupdate', () => {
                const progress = (audio.currentTime / audio.duration) * 100;
                progressBar.style.width = `${progress}%`;
                const currentTime = formatTime(audio.currentTime);
                const totalTime = formatTime(audio.duration);
                if (!isNaN(audio.duration)) {
                    timeDisplay.textContent = `${currentTime} / ${totalTime}`;
                }
            });

            progressBarContainer.addEventListener('click', (e) => {
                const rect = progressBarContainer.getBoundingClientRect();
                audio.currentTime = audio.duration * ((e.clientX - rect.left) / rect.width);
            });
            
             audio.addEventListener('loadedmetadata', () => {
                timeDisplay.textContent = `0:00 / ${formatTime(audio.duration)}`;
            });

            if (skipAdBtn) {
                skipAdBtn.addEventListener('click', () => {
                    if (audio.duration && audio.duration > 60) {
                        audio.currentTime = 60;
                    }
                });
            }
        });
    };
    const fetchLatestEpisodes = async () => {
        const EPISODES_CONTAINER = document.getElementById('episodes-list');
        if (!EPISODES_CONTAINER) return;
        const RSS_FEED_URL = "https://www.rcf.fr/feed/show/2934";
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;
        const iconPlay = `<svg class="icon-play" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>`;
        const iconPause = `<svg class="icon-pause" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;

        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();
            if (data.status !== 'ok' || !data.items || data.items.length === 0) throw new Error("Flux RSS non valide.");

            const latestEpisodes = data.items.slice(0, 4);
            const episodesHtml = latestEpisodes.map(episode => {
                const title = episode.title;
                const audioUrl = episode.enclosure.link;
                const pubDate = new Date(episode.pubDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });

                return `
                    <div class="episode-meta">
                        <h3>${title}</h3>
                        <span class="date">Diffusé le ${pubDate}</span>
                        <div class="custom-player">
                            <audio src="${audioUrl}" preload="metadata"></audio>
                            <button class="play-pause-btn" aria-label="Lire/Mettre en pause">${iconPlay}${iconPause}</button>
                            <div class="progress-time-wrapper">
                                <div class="progress-bar-container"><div class="progress-bar"></div></div>
                                <span class="time-display">0:00 / 0:00</span>
                            </div>
                        </div>
                        <button class="skip-ad-btn">Passer la pub</button>
                    </div>
                `;
            }).join('');

            EPISODES_CONTAINER.innerHTML = episodesHtml;
            initCustomPlayers();

        } catch (error) {
            console.error("Échec :", error);
            EPISODES_CONTAINER.innerHTML = `<p class="muted">Impossible de charger les épisodes.</p>`;
        }
    };
    const form = document.getElementById('contact-form');
    if (form) {
        const status = document.getElementById('form-status');
        form.addEventListener('submit', async (e) => {
            e.preventDefault(); status.textContent = 'Envoi…';
            try {
                const res = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } });
                if (res.ok) { status.textContent = 'Merci ! Message envoyé.'; form.reset(); } else { status.textContent = "Échec de l'envoi."; }
            } catch (err) { status.textContent = 'Erreur réseau.'; }
        });
    }
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('site-nav');
    if (toggle && nav) {
        toggle.addEventListener('click', () => { nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', String(nav.classList.contains('open'))); });
        nav.querySelectorAll('a').forEach(link => { link.addEventListener('click', () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }); });
    }
    const yearSpan = document.getElementById('year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            } else {
                entry.target.classList.remove('visible');
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    const instaUrl = "https://www.instagram.com/bulles_etudiantes";
    document.querySelectorAll('#instaLink').forEach(link => { if(link) link.href = instaUrl; });
    const modalOverlay = document.getElementById('legal-modal'), openBtn = document.getElementById('open-legal'), closeBtn = document.getElementById('close-legal');
    if (modalOverlay && openBtn && closeBtn) {
        openBtn.addEventListener('click', (e) => { e.preventDefault(); modalOverlay.classList.add('open'); });
        closeBtn.addEventListener('click', () => { modalOverlay.classList.remove('open'); });
        modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) { modalOverlay.classList.remove('open'); } });
    }
    
    // On lance les fonctions au chargement
    fetchLatestEpisodes();
    sortAndSplitPlanningTable(); // On appelle la nouvelle fonction de tri
});