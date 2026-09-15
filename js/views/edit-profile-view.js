import { getCurrentUserProfile, updateUserProfile } from '../supabase-client.js';

export async function renderEditProfileView(container) {
    const user = await getCurrentUserProfile();
    if (!user) return;

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-to-profile-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Editar Perfil</h3>
            </div>

            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div>
                        <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Nome Exibido:</label>
                        <input type="text" id="edit-name" class="search-pill-input" value="${user.display_name || ''}" placeholder="Seu nome exibido">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Biografia:</label>
                        <textarea id="edit-bio" class="search-pill-input" rows="3" style="border-radius: var(--radius-md);" placeholder="Fale um pouco sobre você...">${user.bio || ''}</textarea>
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">URL da Foto de Perfil (Avatar):</label>
                        <input type="text" id="edit-avatar" class="search-pill-input" value="${user.avatar_url || ''}" placeholder="https://exemplo.com/minha-foto.jpg">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">URL da Foto de Capa (Perfil):</label>
                        <input type="text" id="edit-cover" class="search-pill-input" value="${user.profile_cover_url || ''}" placeholder="https://exemplo.com/minha-capa.jpg">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Link Letterboxd:</label>
                        <input type="text" id="edit-letterboxd" class="search-pill-input" value="${user.letterboxd_link || ''}" placeholder="letterboxd.com/seu_usuario">
                    </div>
                    <div>
                        <label style="font-size: 0.8rem; color: var(--text-secondary); display: block; margin-bottom: 4px;">Link Serializd:</label>
                        <input type="text" id="edit-serializd" class="search-pill-input" value="${user.serializd_link || ''}" placeholder="serializd.com/seu_usuario">
                    </div>

                    <button class="btn-edit-profile" id="save-profile-btn" style="width: 100%; margin-top: 10px; padding: 12px; font-size: 0.9rem;">
                        💾 Salvar Alterações
                    </button>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#back-to-profile-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('profile');
    });

    container.querySelector('#save-profile-btn').addEventListener('click', async () => {
        const name = container.querySelector('#edit-name').value.trim();
        const bio = container.querySelector('#edit-bio').value.trim();
        const avatar = container.querySelector('#edit-avatar').value.trim();
        const cover = container.querySelector('#edit-cover').value.trim();
        const letterboxd = container.querySelector('#edit-letterboxd').value.trim();
        const serializd = container.querySelector('#edit-serializd').value.trim();

        await updateUserProfile({
            display_name: name,
            bio,
            avatar_url: avatar,
            profile_cover_url: cover,
            letterboxd_link: letterboxd,
            serializd_link: serializd
        });

        alert("Perfil atualizado com sucesso!");
        window.navigateTo('profile');
    });
}
