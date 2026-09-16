import { getCurrentUserProfile, getUserProgress, getFriendsActivities, getMediaByTag } from '../supabase-client.js';

export async function renderHomeView(container) {
    const user = await getCurrentUserProfile();
    const progressList = await getUserProgress();
    const activities = await getFriendsActivities();
    const newEpisodes = await getMediaByTag('novos_episodios');

    const coverUrl = user.profile_cover_url || user.home_banner_url;
    const userBannerHtml = coverUrl
        ? `<img src="${coverUrl}" class="home-banner-img" alt="Capa do perfil">`
        : '<div class="home-banner-img home-banner-fallback" aria-label="Capa do perfil"></div>';

    container.innerHTML = `
        <div class="home-banner-container">
            ${userBannerHtml}
        </div>

        <!-- Card Banner "Apoie o Kindred" -->
        <div class="apoie-banner-card" id="apoie-banner-btn">
            <div class="apoie-banner-left">
                <div class="apoie-k-icon">K</div>
                <div>
                    <div class="apoie-title">Apoie o Kindred</div>
                    <div class="apoie-sub">Assista um anúncio para contribuir, nos ajudando a manter o aplicativo ativo e funcionando.</div>
                </div>
            </div>
            <div style="font-size: 1.2rem; color: var(--text-muted); font-weight: 300;">›</div>
        </div>

        <!-- Seção: Continuar -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span class="filter-icon-btn">≡</span>
                    <span>Continuar</span>
                </h3>
                <span class="see-more-btn" id="see-more-continuar">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                ${progressList.length > 0 ? progressList.map(item => {
                    let progBadge = item.progress_text;
                    if (!progBadge) {
                        if (item.media_type === 'series') {
                            progBadge = `S${String(item.current_season || 1).padStart(2, '0')} • E${String(item.current_episode || 1).padStart(2, '0')}`;
                        } else if (item.media_type === 'book') {
                            progBadge = `Cap ${item.current_chapter || 1}`;
                        } else {
                            progBadge = 'Em progresso';
                        }
                    }

                    return `
                        <div class="poster-card" data-id="${item.id}">
                            <div class="poster-img-wrapper">
                                <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Sem+Capa'}" class="poster-img" alt="${item.title}">
                                <div class="badge-top-right">${item.icon_badge || '✓'}</div>
                                <div class="progress-bar-indicator"></div>
                            </div>
                            <div class="poster-footer-pill">${progBadge}</div>
                        </div>
                    `;
                }).join('') : `
                    <div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px 0;">
                        Nenhum consumo contínuo registrado. Use a busca para adicionar mídias!
                    </div>
                `}
            </div>
        </section>

        <!-- Seção: Novos episódios -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span>Novos episódios</span>
                </h3>
                <span class="see-more-btn" id="see-more-episodes">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                ${newEpisodes.length > 0 ? newEpisodes.map(item => `
                    <div class="poster-card">
                        <div class="poster-img-wrapper">
                            <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Sem+Capa'}" class="poster-img">
                            <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: white;">
                                ${item.release_year || 'S01 E10'}
                            </div>
                        </div>
                    </div>
                `).join('') : `
                    <div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px 0;">
                        Nenhum novo episódio disponível no momento.
                    </div>
                `}
            </div>
        </section>

        ${activities.length > 0 ? `
        <!-- Seção: Atividade de Amigos -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span>Atividade de Amigos</span>
                </h3>
                <span class="see-more-btn" id="see-more-amigos">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                ${activities.map(act => {
                    const stars = '★'.repeat(Math.round(act.rating || 5)) + '☆'.repeat(5 - Math.round(act.rating || 5));

                    return `
                        <div class="friend-activity-poster-card friend-card-click" data-userid="${act.user_id}">
                            <img src="${act.media_poster || 'https://via.placeholder.com/300x450?text=Capa'}" style="width:100%; height:100%; object-fit:cover;">
                            <div class="friend-activity-overlay">
                                <div class="friend-info-row">
                                    ${act.friend_avatar ? `<img src="${act.friend_avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.2);">` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.2);">${(${nameVar} || 'U')[0].toUpperCase()}</div>`}
                                    <div class="friend-name-time">
                                        <span>${act.friend_name || 'Amigo'}</span>
                                        <span style="opacity:0.7; font-weight:400;">${act.date_text || 'Agora'}</span>
                                    </div>
                                </div>
                                ${act.review_text ? `<div style="font-size:0.72rem; color: #E2D5FC; margin-top:2px;">${act.review_text}</div>` : ''}
                                <div class="friend-rating-row">
                                    <span class="friend-rating-stars">${stars}</span>
                                    <span class="heart-icon">♥</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>
        ` : ''}
    `;

    const apoieBanner = container.querySelector('#apoie-banner-btn');
    if (apoieBanner) apoieBanner.addEventListener('click', () => window.navigateTo('apoie'));

    const seeMoreContinuar = container.querySelector('#see-more-continuar');
    if (seeMoreContinuar) seeMoreContinuar.addEventListener('click', () => window.navigateTo('continuar'));

    const seeMoreEpisodes = container.querySelector('#see-more-episodes');
    if (seeMoreEpisodes) seeMoreEpisodes.addEventListener('click', () => window.navigateTo('novos-episodios'));

    const seeMoreAmigos = container.querySelector('#see-more-amigos');
    if (seeMoreAmigos) seeMoreAmigos.addEventListener('click', () => window.navigateTo('amigos'));

    container.querySelectorAll('.friend-card-click').forEach(card => {
        card.addEventListener('click', () => {
            const uid = card.dataset.userid;
            if (uid) window.navigateTo('profile', { userId: uid });
        });
    });

    container.querySelectorAll('.poster-card[data-id]').forEach((card, idx) => {
        card.addEventListener('click', async () => {
            const item = progressList[idx];
            if (item) {
                await fetch('/api/media/progress/advance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: item.id })
                });
                renderHomeView(container);
            }
        });
    });
}
