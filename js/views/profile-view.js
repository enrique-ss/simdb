import { getCurrentUserProfile, updateUserProfile } from '../supabase-client.js';

export async function renderProfileView(container) {
    const user = await getCurrentUserProfile();

    container.innerHTML = `
        <div class="profile-container">
            <!-- 1. Cover Header com botão ... (Figma exact match) -->
            <div class="profile-cover-box">
                <img src="${user.profile_cover_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800'}" class="profile-cover-img">
                <div style="position: absolute; top: 14px; right: 16px; color: white; font-size: 1.3rem; cursor: pointer;">•••</div>
                <img src="${user.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="profile-avatar-floating">
            </div>

            <!-- Informações do Usuário & Ações -->
            <div class="profile-info-header">
                <div class="profile-actions-row">
                    <button class="btn-edit-profile" id="edit-profile-trigger-btn">Editar Perfil</button>
                </div>

                <div>
                    <h2 style="font-size: 1.4rem; font-weight: 800; color: white;">${user.display_name || user.username || 'nicoly'}</h2>
                    <div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 2px;">@${user.username || 'inhunicent'}</div>
                    <div style="color: var(--accent-purple); font-size: 0.75rem; font-weight: 700; margin-top: 4px;">[MEDALHAS AQUI]</div>
                </div>

                <p style="font-size: 0.85rem; color: #D1D1D8; margin-top: 12px; line-height: 1.4;">
                    ${user.bio || 'it was as if he understood the flame that burned inside her as nobody else ever could.'}
                </p>

                <!-- Links das Redes -->
                <div style="display: flex; gap: 12px; margin-top: 10px; font-size: 0.78rem; color: var(--text-secondary);">
                    <span>📍 letterboxd.com/itsmylucy</span>
                    <span>📍 serializd.com/inhunicent</span>
                </div>

                <!-- Painel de Estatísticas 4 colunas (Figma exact match) -->
                <div class="profile-stats-card">
                    <div>
                        <div class="stat-num">300</div>
                        <div class="stat-label">Séries</div>
                    </div>
                    <div>
                        <div class="stat-num">1333</div>
                        <div class="stat-label">Filmes</div>
                    </div>
                    <div>
                        <div class="stat-num">86</div>
                        <div class="stat-label">Jogos</div>
                    </div>
                    <div>
                        <div class="stat-num">8</div>
                        <div class="stat-label">Obras</div>
                    </div>
                </div>

                <!-- Hall da Fama (Figma exact match) -->
                <div style="margin-top: 20px;">
                    <div class="section-header" style="margin-bottom: 8px;">
                        <h3 class="section-title">Hall da Fama</h3>
                    </div>
                    <div style="position: relative; width: 100%; height: 110px; border-radius: var(--radius-md); overflow: hidden; background: #1B1824;">
                        <img src="https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.7;">
                        <div style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); color: white; font-size: 1.3rem;">›</div>
                    </div>
                </div>

                <!-- Favoritos (Figma exact match) -->
                <div style="margin-top: 20px;">
                    <div class="section-header">
                        <h3 class="section-title">Favoritos</h3>
                        <span class="see-more-btn">Ver mais</span>
                    </div>
                    <div class="horizontal-scroll">
                        <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg" class="poster-img"></div>
                        <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" class="poster-img"></div>
                        <div class="poster-card"><img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500" class="poster-img"></div>
                        <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg" class="poster-img"></div>
                    </div>
                </div>

                <!-- Modal de Edição de Perfil & Imagens (RF-004) -->
                <div id="edit-profile-modal-box" class="hidden" style="margin-top: 20px; background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h4 style="color: var(--accent-purple); margin-bottom: 12px;">Editar Perfil e Imagens</h4>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
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
                        <button class="btn-edit-profile" id="save-profile-btn" style="width:100%; margin-top:10px;">Salvar</button>
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
        const avatar = container.querySelector('#edit-avatar').value.trim();
        const cover = container.querySelector('#edit-cover').value.trim();
        const banner = container.querySelector('#edit-banner').value.trim();

        await updateUserProfile({ avatar_url: avatar, profile_cover_url: cover, home_banner_url: banner });
        alert("Perfil atualizado com sucesso!");
        renderProfileView(container);
    });
}
