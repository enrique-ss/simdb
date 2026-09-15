import { getCurrentUserProfile, getUserProgress, getFriendsActivities, getMediaByTag } from '../supabase-client.js';
import { BOOK_ICON_EMOJI } from '../config.js';

export async function renderHomeView(container) {
    const user = await getCurrentUserProfile();
    const progressList = await getUserProgress();
    const activities = await getFriendsActivities();
    const newEpisodes = await getMediaByTag('novos_episodios');

    container.innerHTML = `
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

        <!-- Seção: Continuar (100% Dinâmico do SQLite) -->
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
                    const isBook = item.media_type === 'book';
                    const iconBadge = isBook ? BOOK_ICON_EMOJI : '✓';
                    const progressText = isBook 
                        ? `Pág ${item.current_chapter} de ${item.total_chapters || '?'}` 
                        : `S${String(item.current_season).padStart(2, '0')} • E${String(item.current_episode).padStart(2, '0')}`;
                    
                    return `
                        <div class="poster-card" data-id="${item.id}">
                            <div class="poster-img-wrapper">
                                <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Sem+Capa'}" class="poster-img" alt="${item.title}">
                                <div class="badge-top-right">${iconBadge}</div>
                                <div class="progress-bar-indicator"></div>
                            </div>
                            <div class="poster-footer-pill">${progressText}</div>
                        </div>
                    `;
                }).join('') : `
                    <div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px 0;">
                        Nenhum consumo contínuo registrado. Use a busca para adicionar mídias!
                    </div>
                `}
            </div>
        </section>

        <!-- Seção: Novos episódios (100% Dinâmico do SQLite) -->
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
                                S01 E10
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

        <!-- Seção: Atividade de Amigos (100% Dinâmico do SQLite) -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span>Atividade de Amigos</span>
                </h3>
                <span class="see-more-btn" id="see-more-amigos">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                ${activities.length > 0 ? activities.map(act => {
                    let mediaIconEmoji = "🎬";
                    if (act.media_type === 'series') mediaIconEmoji = "📺";
                    if (act.media_type === 'game') mediaIconEmoji = "🎮";
                    if (act.media_type === 'book') mediaIconEmoji = BOOK_ICON_EMOJI;

                    const stars = '★'.repeat(Math.round(act.rating || 5)) + '☆'.repeat(5 - Math.round(act.rating || 5));

                    return `
                        <div class="friend-activity-poster-card">
                            <img src="${act.media_poster || 'https://via.placeholder.com/300x450?text=Capa'}" style="width:100%; height:100%; object-fit:cover;">
                            <div class="friend-activity-overlay">
                                <div class="friend-info-row">
                                    <img src="${act.friend_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="friend-avatar-tiny">
                                    <div class="friend-name-time">
                                        <span>${act.friend_name || 'Amigo'}</span>
                                        <span style="opacity:0.7; font-weight:400;">${act.date_text || 'Agora'}</span>
                                    </div>
                                </div>
                                <div class="friend-rating-row">
                                    <span>${mediaIconEmoji}</span>
                                    <span class="friend-rating-stars">${stars}</span>
                                    <span class="heart-icon">♥</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('') : `
                    <div style="color: var(--text-muted); font-size: 0.85rem; padding: 20px 0;">
                        Nenhuma atividade de amigos registrada até o momento.
                    </div>
                `}
            </div>
        </section>
    `;

    const apoieBanner = container.querySelector('#apoie-banner-btn');
    if (apoieBanner) {
        apoieBanner.addEventListener('click', () => {
            window.navigateTo('apoie');
        });
    }

    const seeMoreContinuar = container.querySelector('#see-more-continuar');
    if (seeMoreContinuar) seeMoreContinuar.addEventListener('click', () => window.navigateTo('continuar-full'));

    const seeMoreEpisodes = container.querySelector('#see-more-episodes');
    if (seeMoreEpisodes) seeMoreEpisodes.addEventListener('click', () => window.navigateTo('continuar-full'));

    const seeMoreAmigos = container.querySelector('#see-more-amigos');
    if (seeMoreAmigos) seeMoreAmigos.addEventListener('click', () => window.navigateTo('amigos'));

    container.querySelectorAll('.poster-card[data-id]').forEach((card, idx) => {
        card.addEventListener('click', async () => {
            const item = progressList[idx];
            if (item) {
                await fetch('/api/progress/advance', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: item.id })
                });
                renderHomeView(container);
            }
        });
    });
}
