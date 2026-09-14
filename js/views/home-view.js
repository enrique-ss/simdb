import { getCurrentUserProfile, getUserProgress, getFriendsActivities } from '../supabase-client.js';
import { BOOK_ICON_EMOJI } from '../config.js';

export async function renderHomeView(container) {
    const user = await getCurrentUserProfile();
    const progressList = await getUserProgress();

    container.innerHTML = `
        <!-- Card Banner "Apoie o Kindred" (Visual idêntico ao Figma) -->
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

        <!-- Seção: Continuar (Figma exact match) -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span class="filter-icon-btn">≡</span>
                    <span>Continuar</span>
                </h3>
                <span class="see-more-btn">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                ${progressList.map(item => {
                    const isBook = item.media_type === 'book';
                    const iconBadge = isBook ? BOOK_ICON_EMOJI : '✓';
                    const progressText = isBook 
                        ? `Pág ${item.current_chapter} de ${item.total_chapters || '436'}` 
                        : `S${String(item.current_season).padStart(2, '0')} • E${String(item.current_episode).padStart(2, '0')}`;
                    
                    return `
                        <div class="poster-card" data-id="${item.id}">
                            <div class="poster-img-wrapper">
                                <img src="${item.poster}" class="poster-img" alt="${item.title}">
                                <div class="badge-top-right">${iconBadge}</div>
                                <div class="progress-bar-indicator"></div>
                            </div>
                            <div class="poster-footer-pill">${progressText}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        </section>

        <!-- Seção: Novos episódios (Figma exact match) -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span>Novos episódios</span>
                </h3>
                <span class="see-more-btn">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                <div class="poster-card">
                    <div class="poster-img-wrapper">
                        <img src="https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg" class="poster-img">
                        <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: white;">
                            S01 E10
                        </div>
                    </div>
                </div>
                <div class="poster-card">
                    <div class="poster-img-wrapper">
                        <img src="https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg" class="poster-img">
                        <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: white;">
                            S01 E10
                        </div>
                    </div>
                </div>
                <div class="poster-card">
                    <div class="poster-img-wrapper">
                        <img src="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" class="poster-img">
                        <div style="position: absolute; bottom: 6px; left: 6px; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; font-weight: 700; color: white;">
                            S01 E10
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Seção: Atividade de Amigos (Figma exact match) -->
        <section class="section">
            <div class="section-header">
                <h3 class="section-title">
                    <span>Atividade de Amigos</span>
                </h3>
                <span class="see-more-btn">Ver mais</span>
            </div>
            <div class="horizontal-scroll">
                <div class="friend-activity-poster-card">
                    <img src="https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg" style="width:100%; height:100%; object-fit:cover;">
                    <div class="friend-activity-overlay">
                        <div class="friend-info-row">
                            <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" class="friend-avatar-tiny">
                            <div class="friend-name-time">
                                <span>Luana</span>
                                <span style="opacity:0.7; font-weight:400;">2h</span>
                            </div>
                        </div>
                        <div class="friend-rating-row">
                            <span>📺</span>
                            <span class="friend-rating-stars">★★★★★</span>
                            <span class="heart-icon">♥</span>
                        </div>
                    </div>
                </div>

                <div class="friend-activity-poster-card">
                    <img src="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" style="width:100%; height:100%; object-fit:cover;">
                    <div class="friend-activity-overlay">
                        <div class="friend-info-row">
                            <img src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150" class="friend-avatar-tiny">
                            <div class="friend-name-time">
                                <span>Thay</span>
                                <span style="opacity:0.7; font-weight:400;">4h</span>
                            </div>
                        </div>
                        <div class="friend-rating-row">
                            <span>🎬</span>
                            <span class="friend-rating-stars">★★★★★</span>
                            <span class="heart-icon">♥</span>
                        </div>
                    </div>
                </div>

                <div class="friend-activity-poster-card">
                    <img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500" style="width:100%; height:100%; object-fit:cover;">
                    <div class="friend-activity-overlay">
                        <div class="friend-info-row">
                            <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" class="friend-avatar-tiny">
                            <div class="friend-name-time">
                                <span>Mafe</span>
                                <span style="opacity:0.7; font-weight:400;">8h</span>
                            </div>
                        </div>
                        <div class="friend-rating-row">
                            <span>🎮</span>
                            <span class="friend-rating-stars">★★★★★</span>
                            <span class="heart-icon">♥</span>
                        </div>
                    </div>
                </div>

                <div class="friend-activity-poster-card">
                    <img src="https://covers.openlibrary.org/b/id/8311916-M.jpg" style="width:100%; height:100%; object-fit:cover;">
                    <div class="friend-activity-overlay">
                        <div class="friend-info-row">
                            <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150" class="friend-avatar-tiny">
                            <div class="friend-name-time">
                                <span>Alice</span>
                                <span style="opacity:0.7; font-weight:400;">1d</span>
                            </div>
                        </div>
                        <div class="friend-rating-row">
                            <span>${BOOK_ICON_EMOJI}</span>
                            <span class="friend-rating-stars">★★★★☆</span>
                            <span class="heart-icon">♥</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;

    const apoieBanner = container.querySelector('#apoie-banner-btn');
    if (apoieBanner) {
        apoieBanner.addEventListener('click', () => {
            window.navigateTo('apoie');
        });
    }
}
