import { getCurrentUserProfile, updateUserProfile } from '../supabase-client.js';

const themes = [
    { value: 'violet', label: 'Violeta' },
    { value: 'rose', label: 'Rosa' },
    { value: 'ocean', label: 'Oceano' }
];

export async function renderSettingsView(container) {
    const user = await getCurrentUserProfile();
    if (!user) return;

    const bool = value => Number(value) === 1 || value === true;
    const selectedTheme = themes.some(theme => theme.value === user.profile_theme) ? user.profile_theme : 'violet';

    container.innerHTML = `
        <section class="settings-page section">
            <header class="settings-header">
                <button class="settings-back" id="settings-back-btn" aria-label="Voltar">‹</button>
                <div><span class="settings-eyebrow">SUA CONTA</span><h1>Configurações</h1></div>
            </header>

            <div class="settings-profile-card">
                ${user.avatar_url ? `<img src="${user.avatar_url}" alt="" class="settings-avatar">` : ''}
                <div><strong>${user.display_name || user.username}</strong><span>@${user.username}</span></div>
                <button class="settings-quiet-button" id="edit-profile-btn">Editar perfil</button>
            </div>

            <div class="settings-group">
                <div class="settings-group-title">Privacidade</div>
                <div class="settings-card">
                    <label class="settings-row"><span><strong>Conta privada</strong></span><input id="private-toggle" type="checkbox" class="settings-toggle" ${bool(user.is_private) ? 'checked' : ''}></label>
                    <label class="settings-row"><span><strong>Estatísticas privadas</strong></span><input id="stats-private-toggle" type="checkbox" class="settings-toggle" ${bool(user.stats_private) ? 'checked' : ''}></label>
                    <button class="settings-row settings-link-row" id="blocked-btn"><span><strong>Contas bloqueadas</strong></span><b>›</b></button>
                </div>
            </div>

            <div class="settings-group">
                <div class="settings-group-title">Aparência</div>
                <div class="settings-card settings-theme-row">
                    <span><strong>Cor do perfil</strong></span>
                    <div class="theme-picker">${themes.map(theme => `<button class="theme-dot ${theme.value} ${selectedTheme === theme.value ? 'selected' : ''}" data-theme="${theme.value}" aria-label="Tema ${theme.label}" title="${theme.label}"></button>`).join('')}</div>
                </div>
                <button class="settings-card settings-row settings-link-row" id="home-banner-btn"><span><strong>Banner inicial</strong></span><b>›</b></button>
            </div>

            <div class="settings-group">
                <div class="settings-group-title">Preferências</div>
                <div class="settings-card">
                    <label class="settings-select-row"><span><strong>Filtro de mídia</strong></span><select id="media-filter-select"><option value="all">Tudo</option><option value="movies">Filmes</option><option value="series">Séries</option><option value="games">Jogos</option><option value="books">Livros</option></select></label>
                    <label class="settings-select-row"><span><strong>Idioma e região</strong></span><select id="language-select"><option value="pt-BR">Português (Brasil)</option><option value="en-US">English (US)</option><option value="es-ES">Español</option></select></label>
                    <label class="settings-row"><span><strong>Notificações</strong></span><input id="notifications-toggle" type="checkbox" class="settings-toggle" ${bool(user.notifications_enabled) ? 'checked' : ''}></label>
                </div>
            </div>

            ${user.role === 'admin' ? `
                <div class="settings-group">
                    <div class="settings-group-title">Administração</div>
                    <button class="settings-card settings-row settings-link-row" id="admin-panel-btn"><span><strong>Painel administrativo</strong></span><b>›</b></button>
                </div>
            ` : ''}

            <p class="settings-save-status" id="settings-save-status" aria-live="polite"></p>
            <button class="settings-signout" id="logout-btn">Sair da conta</button>
        </section>`;

    const selectValue = (id, value, fallback) => {
        const input = container.querySelector(id);
        input.value = [...input.options].some(option => option.value === value) ? value : fallback;
    };
    selectValue('#media-filter-select', user.media_filter, 'all');
    selectValue('#language-select', user.language_region, 'pt-BR');

    const status = container.querySelector('#settings-save-status');
    async function persist(updates, message = 'Salvo') {
        status.textContent = 'Salvando…';
        try {
            await updateUserProfile(updates);
            status.textContent = message;
            window.setTimeout(() => { if (status.textContent === message) status.textContent = ''; }, 1800);
        } catch (error) {
            status.textContent = error.message || 'Não foi possível salvar. Tente novamente.';
        }
    }

    container.querySelector('#settings-back-btn').addEventListener('click', () => window.navigateBack());
    container.querySelector('#edit-profile-btn').addEventListener('click', () => window.navigateTo('edit-profile'));
    container.querySelector('#home-banner-btn').addEventListener('click', () => window.navigateTo('edit-profile'));
    container.querySelector('#blocked-btn').addEventListener('click', () => window.navigateTo('blocked'));
    const adminPanelBtn = container.querySelector('#admin-panel-btn');
    if (adminPanelBtn) adminPanelBtn.addEventListener('click', () => window.navigateTo('admin'));
    container.querySelector('#private-toggle').addEventListener('change', event => persist({ is_private: event.target.checked }));
    container.querySelector('#stats-private-toggle').addEventListener('change', event => persist({ stats_private: event.target.checked }));
    container.querySelector('#notifications-toggle').addEventListener('change', event => persist({ notifications_enabled: event.target.checked }));
    container.querySelector('#media-filter-select').addEventListener('change', event => persist({ media_filter: event.target.value }));
    container.querySelector('#language-select').addEventListener('change', event => persist({ language_region: event.target.value }));
    container.querySelectorAll('[data-theme]').forEach(button => button.addEventListener('click', async () => {
        const theme = button.dataset.theme;
        document.documentElement.dataset.profileTheme = theme;
        container.querySelectorAll('[data-theme]').forEach(dot => dot.classList.toggle('selected', dot === button));
        await persist({ profile_theme: theme }, 'Cor atualizada');
    }));
    container.querySelector('#logout-btn').addEventListener('click', () => {
        localStorage.removeItem('kindred_session_user');
        localStorage.removeItem('kindred_token');
        window.location.reload();
    });
}
