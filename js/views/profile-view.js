import { getCurrentUserProfile, updateUserProfile, getMediaByTag } from '../supabase-client.js';

export async function renderProfileView(container) {
    const user = await getCurrentUserProfile();
    if (!user) return;

    const favoritos = await getMediaByTag('favoritos');
    const userInitial = (user.display_name || user.username || 'U')[0].toUpperCase();

    const coverHtml = user.profile_cover_url 
        ? `<img src="${user.profile_cover_url}" class="profile-cover-img">` 
        : `<div class="profile-cover-img" style="background: linear-gradient(135deg, #1f1b2e 0%, #121018 100%);"></div>`;

    const avatarHtml = user.avatar_url 
        ? `<img src="${user.avatar_url}" class="profile-avatar-floating">` 
        : `<div class="profile-avatar-floating" style="background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800;">${userInitial}</div>`;

    container.innerHTML = `
        <div class="profile-container">
            <!-- 1. Cover Header (Sem Placeholders Fictícios) -->
            <div class="profile-cover-box">
                ${coverHtml}
                <div style="position: absolute; top: 14px; right: 16px; color: white; font-size: 1.3rem; cursor: pointer;">•••</div>
                ${avatarHtml}
            </div>

            <!-- Informações do Usuário & Ações -->
            <div class="profile-info-header">
                <div class="profile-actions-row">
                    <button class="btn-edit-profile" id="edit-profile-trigger-btn">Editar Perfil</button>
                </div>

                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: white;">${user.display_name || user.username}</h2>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 2px;">@${user.username}</div>
                    <div id="medalhas-trigger-btn" style="color: var(--accent-purple); font-size: 0.75rem; font-weight: 700; margin-top: 4px; cursor: pointer;">🏆 Ver Conquistas & Medalhas</div>
                </div>

                <p style="font-size: 0.85rem; color: #D1D1D8; margin-top: 12px; line-height: 1.4;">
                    ${user.bio || 'Sem biografia informada.'}
                </p>

                <!-- Links das Redes -->
                ${(user.letterboxd_link || user.serializd_link) ? `
                    <div style="display: flex; gap: 12px; margin-top: 10px; font-size: 0.78rem; color: var(--text-secondary);">
                        ${user.letterboxd_link ? `<span>📍 ${user.letterboxd_link}</span>` : ''}
                        ${user.serializd_link ? `<span>📍 ${user.serializd_link}</span>` : ''}
                    </div>
                ` : ''}

                <!-- Abas de Navegação do Perfil -->
                <div style="display: flex; gap: 6px; overflow-x: auto; margin-top: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <button class="category-card-btn prof-tab-btn" data-tab="profile-feed" style="padding: 6px 10px; font-size: 0.78rem;">Feed</button>
                    <button class="category-card-btn prof-tab-btn" data-tab="profile-biblioteca" style="padding: 6px 10px; font-size: 0.78rem;">Biblioteca</button>
                    <button class="category-card-btn prof-tab-btn" data-tab="profile-diario" style="padding: 6px 10px; font-size: 0.78rem;">Diário</button>
                    <button class="category-card-btn prof-tab-btn" data-tab="profile-listas" style="padding: 6px 10px; font-size: 0.78rem;">Listas</button>
                    <button class="category-card-btn prof-tab-btn" data-tab="profile-avaliacoes" style="padding: 6px 10px; font-size: 0.78rem;">Avaliações</button>
                </div>

                <!-- Painel de Estatísticas 4 colunas -->
                <div class="profile-stats-card" id="stats-card-trigger-btn" style="cursor: pointer;">
                    <div>
                        <div class="stat-num">${user.series_count || 0}</div>
                        <div class="stat-label">Séries</div>
                    </div>
                    <div>
                        <div class="stat-num">${user.movies_count || 0}</div>
                        <div class="stat-label">Filmes</div>
                    </div>
                    <div>
                        <div class="stat-num">${user.games_count || 0}</div>
                        <div class="stat-label">Jogos</div>
                    </div>
                    <div>
                        <div class="stat-num">${user.works_count || 0}</div>
                        <div class="stat-label">Obras</div>
                    </div>
                </div>

                <!-- Hall da Fama -->
                <div style="margin-top: 20px;" id="hall-fama-trigger-btn" style="cursor: pointer;">
                    <div class="section-header" style="margin-bottom: 8px;">
                        <h3 class="section-title">Hall da Fama</h3>
                    </div>
                    <div style="position: relative; width: 100%; height: 110px; border-radius: var(--radius-md); overflow: hidden; background: #1B1824; cursor: pointer; display: flex; align-items: center; justify-content: center;">
                        <span style="color: var(--text-muted); font-size: 0.85rem;">Ver Personagens e Ships Favoritos</span>
                        <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: white; font-size: 1.3rem;">›</div>
                    </div>
                </div>

                <!-- Favoritos -->
                <div style="margin-top: 20px;">
                    <div class="section-header">
                        <h3 class="section-title">Favoritos</h3>
                        <span class="see-more-btn">Ver mais</span>
                    </div>
                    <div class="horizontal-scroll">
                        ${favoritos.length > 0 ? favoritos.map(item => `
                            <div class="poster-card" data-id="${item.id}"><img src="${item.poster}" class="poster-img"></div>
                        `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhum favorito adicionado ainda.</div>'}
                    </div>
                </div>
            </div>
        </div>
    `;

    const editTrigger = container.querySelector('#edit-profile-trigger-btn');
    editTrigger.addEventListener('click', () => {
        window.navigateTo('edit-profile');
    });

    const medalhasBtn = container.querySelector('#medalhas-trigger-btn');
    if (medalhasBtn) medalhasBtn.addEventListener('click', () => window.navigateTo('conquistas'));

    const statsBtn = container.querySelector('#stats-card-trigger-btn');
    if (statsBtn) statsBtn.addEventListener('click', () => window.navigateTo('estatisticas'));

    const hallFamaBtn = container.querySelector('#hall-fama-trigger-btn');
    if (hallFamaBtn) hallFamaBtn.addEventListener('click', () => window.navigateTo('hall-fama'));

    container.querySelectorAll('.prof-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.tab;
            if (target) window.navigateTo(target);
        });
    });
}
