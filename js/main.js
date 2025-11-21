document.addEventListener("DOMContentLoaded", () => {
    
    /* --- 1. MENU BURGER MOBILE --- */
    const navToggle = document.querySelector(".nav-toggle");
    const siteNav = document.querySelector(".site-nav");

    if (navToggle && siteNav) {
        navToggle.addEventListener("click", () => {
            siteNav.classList.toggle("open");
            navToggle.classList.toggle("active");
        });
        document.addEventListener("click", (e) => {
            if (!siteNav.contains(e.target) && !navToggle.contains(e.target) && siteNav.classList.contains("open")) {
                siteNav.classList.remove("open");
                navToggle.classList.remove("active");
            }
        });
    }

    /* --- 2. FOOTER --- */
    const yearSpan = document.getElementById("year");
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    /* --- 3. MODALE LÉGALE --- */
    const openLegalBtn = document.getElementById("open-legal");
    const legalModal = document.getElementById("legal-modal");
    const closeLegalBtn = document.getElementById("close-legal");
    if (openLegalBtn && legalModal && closeLegalBtn) {
        openLegalBtn.addEventListener("click", (e) => { e.preventDefault(); legalModal.classList.add("open"); });
        closeLegalBtn.addEventListener("click", () => { legalModal.classList.remove("open"); });
        legalModal.addEventListener("click", (e) => { if (e.target === legalModal) legalModal.classList.remove("open"); });
    }

    /* --- 4. REVEAL SCROLL --- */
    const revealElements = document.querySelectorAll(".reveal");
    function revealOnScroll() {
        const windowHeight = window.innerHeight;
        const revealPoint = 150;
        revealElements.forEach((el) => {
            if (el.getBoundingClientRect().top < windowHeight - revealPoint) el.classList.add("visible");
        });
    }
    window.addEventListener("scroll", revealOnScroll);
    revealOnScroll();

    /* --- 5. POP-UP MEMBRES --- */
    const memberModal = document.getElementById('member-modal');
    const memberModalClose = document.getElementById('close-member-modal');
    const modalImg = document.getElementById('modal-member-img');
    const modalName = document.getElementById('modal-member-name');
    const modalDesc = document.getElementById('modal-member-desc');
    const memberTriggers = document.querySelectorAll('.member-img-trigger');

    if (memberModal && memberTriggers.length > 0) {
        memberTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const imgSrc = trigger.src;
                const description = trigger.getAttribute('data-description');
                let name = trigger.getAttribute('data-name');
                if (!name) {
                    const card = trigger.closest('.member-card');
                    if (card) name = card.querySelector('.member-name').textContent;
                }
                modalImg.src = imgSrc;
                modalImg.alt = name || "";
                modalName.textContent = name || "";
                modalDesc.textContent = description || "";
                memberModal.classList.add('open');
                document.body.style.overflow = 'hidden';
            });
        });
        function closeMemberModal() { memberModal.classList.remove('open'); document.body.style.overflow = ''; }
        if (memberModalClose) memberModalClose.addEventListener('click', closeMemberModal);
        memberModal.addEventListener('click', (e) => { if (e.target === memberModal) closeMemberModal(); });
    }

    /* --- 6. LECTEUR AUDIO --- */
    const initCustomPlayers = () => {
        document.querySelectorAll('.episode-meta').forEach(episodeCard => {
            const audio = episodeCard.querySelector('audio');
            const playPauseBtn = episodeCard.querySelector('.play-pause-btn');
            const progressBar = episodeCard.querySelector('.progress-bar');
            const progressBarContainer = episodeCard.querySelector('.progress-bar-container');
            const timeDisplay = episodeCard.querySelector('.time-display');
            const skipAdBtn = episodeCard.querySelector('.skip-ad-btn');
            
            // Icônes
            const iconPlay = episodeCard.querySelector('.icon-play');
            const iconPause = episodeCard.querySelector('.icon-pause');

            if (!audio || !playPauseBtn) return;

            const formatTime = (s) => {
                const m = Math.floor(s / 60);
                const sec = Math.floor(s % 60);
                return `${m}:${sec < 10 ? '0' : ''}${sec}`;
            };

            audio.addEventListener('loadedmetadata', () => {
                const total = formatTime(audio.duration);
                timeDisplay.textContent = `0:00 / ${total}`;
            });

            playPauseBtn.addEventListener('click', () => {
                if (audio.paused) {
                    document.querySelectorAll('audio').forEach(other => { 
                        if(other !== audio) { 
                            other.pause(); 
                            const btn = other.parentElement.querySelector('.play-pause-btn');
                            if(btn) {
                                btn.querySelector('.icon-play').style.display = 'block';
                                btn.querySelector('.icon-pause').style.display = 'none';
                            }
                        } 
                    });
                    audio.play();
                    if(iconPlay) iconPlay.style.display = 'none';
                    if(iconPause) iconPause.style.display = 'block';
                } else {
                    audio.pause();
                    if(iconPlay) iconPlay.style.display = 'block';
                    if(iconPause) iconPause.style.display = 'none';
                }
            });

            audio.addEventListener('timeupdate', () => {
                if (audio.duration) {
                    const progress = (audio.currentTime / audio.duration) * 100;
                    progressBar.style.width = `${progress}%`;
                    timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
                }
            });

            progressBarContainer.addEventListener('click', (e) => {
                const rect = progressBarContainer.getBoundingClientRect();
                audio.currentTime = audio.duration * ((e.clientX - rect.left) / rect.width);
            });

            if (skipAdBtn) {
                skipAdBtn.addEventListener('click', () => {
                    if (audio.duration) {
                        audio.currentTime = (audio.currentTime < 60) ? 60 : audio.currentTime + 30;
                        audio.play();
                        if(iconPlay) iconPlay.style.display = 'none';
                        if(iconPause) iconPause.style.display = 'block';
                    }
                });
            }
        });
    };

    const loadEpisodes = async (containerId, limit) => {
        const container = document.getElementById(containerId);
        if (!container) return;

        const RSS_FEED_URL = "https://www.rcf.fr/feed/show/2934";
        const proxyUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(RSS_FEED_URL)}`;
        
        const iconPlay = `<svg class="icon-play" viewBox="0 0 24 24" style="display:block;"><path d="M8 5v14l11-7z"></path></svg>`;
        const iconPause = `<svg class="icon-pause" viewBox="0 0 24 24" style="display:none;"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg>`;

        try {
            const response = await fetch(proxyUrl);
            const data = await response.json();
            if (data.status !== 'ok' || !data.items) throw new Error("Erreur RSS");

            const episodes = data.items.slice(0, limit);
            
            const html = episodes.map(episode => {
                const title = episode.title;
                const audioUrl = episode.enclosure.link;
                const pubDate = new Date(episode.pubDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                const link = episode.link;

                return `
                    <div class="episode-meta">
                        <a href="${link}" target="_blank" style="text-decoration:none;">
                            <h3>${title}</h3>
                        </a>
                        <span class="date">Diffusé le ${pubDate}</span>
                        
                        <div class="custom-player">
                            <button class="play-pause-btn" aria-label="Lire">
                                ${iconPlay}${iconPause}
                            </button>
                            <div class="progress-time-wrapper">
                                <div class="progress-bar-container"><div class="progress-bar"></div></div>
                                <span class="time-display">--:-- / --:--</span>
                            </div>
                            <audio src="${audioUrl}" preload="metadata"></audio>
                        </div>
                        <button class="skip-ad-btn">Passer la pub</button>
                    </div>
                `;
            }).join('');

            container.innerHTML = html;
            initCustomPlayers();

        } catch (error) {
            console.error(error);
            container.innerHTML = `<p class="muted" style="grid-column:1/-1; text-align:center;">Impossible de charger les émissions.</p>`;
        }
    };

    if (document.getElementById('episodes-list')) loadEpisodes('episodes-list', 4);
    if (document.getElementById('special-episodes-list')) loadEpisodes('special-episodes-list', 6);


    /* ========================================= */
    /* --- 7. GESTION DU PLANNING (AJOUTÉ) --- */
    /* ========================================= */
    const sortAndSplitPlanningTable = () => {
        const sourceTable = document.getElementById('planning-source-table');
        const upcomingBody = document.getElementById('upcoming-sessions-body');
        const pastBody = document.getElementById('past-sessions-body');

        // Si on n'est pas sur la page planning, on arrête.
        if (!sourceTable || !upcomingBody || !pastBody) return;

        const rows = Array.from(sourceTable.querySelectorAll('tbody tr'));
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Pour comparer uniquement la date

        rows.forEach(row => {
            const dateCell = row.querySelector('td');
            if (!dateCell) return;

            // Convertit "15/10/2025" en objet Date
            const dateText = dateCell.textContent.trim();
            const dateParts = dateText.split('/');
            // Mois commence à 0 en JS (janvier = 0)
            const sessionDate = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);

            // On clone la ligne pour ne pas détruire la source
            const newRow = row.cloneNode(true);

            // Comparaison
            if (sessionDate < today) {
                pastBody.appendChild(newRow); // C'est passé
            } else {
                upcomingBody.appendChild(newRow); // C'est à venir
            }
        });
    };

    // Lancer le tri du planning au chargement
    sortAndSplitPlanningTable();
});