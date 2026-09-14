import { getCurrentUserProfile, updateUserProfile, getMediaByTag } from '../supabase-client.js';

export async function renderProfileView(container) {
    const user = await getCurrentUserProfile();
    if (!user) return;

    const favoritos = await getMediaByTag('favoritos');

    container.innerHTML = `
        <div class="profile-container">
            <!-- 1. Cover Header (100% Dinâmico do SQLite) -->
            <div class="profile-cover-box">
                <img src="${user.profile_cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}" class="profile-cover-img">
                <div style="position: absolute; top: 14px; right: 16px; color: white; font-size: 1.3rem; cursor: pointer;">•••</div>
                <img src="${user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="profile-avatar-floating">
            </div>

            <!-- Informações do Usuário & Ações (100% Dinâmico do SQLite) -->
            <div class="profile-info-header">
                <div class="profile-actions-row">
                    <button class="btn-edit-profile" id="edit-profile-trigger-btn">Editar Perfil</button>
                </div>

                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: white;">${user.display_name || user.username}</h2>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 2px;">@${user.username}</div>
                    <div style="color: var(--accent-purple); font-size: 0.75rem; font-weight: 700; margin-top: 4px;">[MEDALHAS AQUI]</div>
                </div>

                <p style="font-size: 0.85rem; color: #D1D1D8; margin-top: 12px; line-height: 1.4;">
                    ${user.bio || 'Sem biografia informada.'}
                </p>

                <!-- Links das Redes (100% Dinâmico do SQLite) -->
                ${(user.letterboxd_link || user.serializd_link) ? `
                    <div style="display: flex; gap: 12px; margin-top: 10px; font-size: 0.78rem; color: var(--text-secondary);">
                        ${user.letterboxd_link ? `<span>📍 ${user.letterboxd_link}</span>` : ''}
                        ${user.serializd_link ? `<span>📍 ${user.serializd_link}</span>` : ''}
                    </div>
                ` : ''}

                <!-- Painel de Estatísticas 4 colunas (100% Dinâmico do SQLite) -->
                <div class="profile-stats-card">
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
                <div style="margin-top: 20px;">
                    <div class="section-header" style="margin-bottom: 8px;">
                        <h3 class="section-title">Hall da Fama</h3>
                    </div>
                    <div style="position: relative; width: 100%; height: 110px; border-radius: var(--radius-md); overflow: hidden; background: #1B1824;">
                        <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.7;">
                        <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: white; font-size: 1.3rem;">›</div>
                    </div>
                </div>

                <!-- Favoritos (100% Dinâmico do SQLite) -->
                <div style="margin-top: 20px;">
                    <div class="section-header">
                        <h3 class="section-title">Favoritos</h3>
                        <span class="see-more-btn">Ver mais</span>
                    </div>
                    <div class="horizontal-scroll">
                        ${favoritos.length > 0 ? favoritos.map(item => `
                            <div class="poster-card" data-id="${item.id}"><img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img"></div>
                        `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhum favorito adicionado ainda.</div>'}
                    </div>
                </div>

                <!-- Modal de Edição de Perfil & Imagens (Persiste no SQLite) -->
                <div id="edit-profile-modal-box" class="hidden" style="margin-top: 20px; background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h4 style="color: var(--accent-purple); margin-bottom: 12px;">Editar Perfil e Imagens</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-secondary);">Nome Exibido:</label>
                            <input type="text" id="edit-name" class="search-pill-input" value="${user.display_name || ''}">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-secondary);">Biografia:</label>
                            <input type="text" id="edit-bio" class="search-pill-input" value="${user.bio || ''}">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-secondary);">Foto de Perfil (Avatar):</label>
                            <input type="text" id="edit-avatar" class="search-pill-input" value="${user.avatar_url || ''}">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-secondary);">Foto de Capa (Perfil):</label>
                            <input type="text" id="edit-cover" class="search-pill-input" value="${user.profile_cover_url || ''}">
                        </div>
                        <div>
                            <label style="font-size: 0.75rem; color: var(--text-secondary);">Banner da Home:</label>
                            <input type="text" id="edit-banner" class="search-pill-input" value="${user.home_banner_url || ''}">
                        </div>
                        <button class="btn-edit-profile" id="save-profile-btn" style="width:100%; margin-top:10px;">Salvar Alterações</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const editTrigger = container.querySelector('#edit-profile-trigger-btn');
    const modalBox = container.querySelector('#edit-profile-modal-box');
    const saveBtn = container.querySelector('#save-profile-btn');

    editTrigger.addEventListener('click', () => {
        modalBox.classList.toggle('hidden');
    });

    saveBtn.addEventListener('click', async () => {
        const name = container.querySelector('#edit-name').value.trim();
        const bio = container.querySelector('#edit-bio').value.trim();
        const avatar = container.querySelector('#edit-avatar').value.trim();
        const cover = container.querySelector('#edit-cover').value.trim();
        const banner = container.querySelector('#edit-banner').value.trim();

        await updateUserProfile({ display_name: name, bio, avatar_url: avatar, profile_cover_url: cover, home_banner_url: banner });
        alert("Perfil atualizado com sucesso no banco de dados!");
        renderProfileView(container);
    });
}
