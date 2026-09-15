import { getToken } from '../supabase-client.js';

export async function renderAdminView(container) {
    const token = getToken();
    if (!token) return window.navigateTo('home');

    container.innerHTML = `
        <section class="settings-page section admin-page">
            <header class="settings-header"><button class="settings-back" id="admin-back" aria-label="Voltar">‹</button><div><span class="settings-eyebrow">ADMINISTRAÇÃO</span><h1>Painel administrativo</h1></div></header>
            <div class="settings-group"><div class="settings-group-title">Catálogo</div><form id="admin-media-form" class="admin-card">
                <input name="title" required maxlength="180" placeholder="Título da mídia">
                <select name="media_type" required><option value="movie">Filme</option><option value="series">Série</option><option value="game">Jogo</option><option value="book">Livro</option></select>
                <input name="poster" type="url" placeholder="URL da capa (opcional)">
                <input name="release_year" maxlength="10" placeholder="Ano de lançamento (opcional)">
                <textarea name="overview" maxlength="2000" placeholder="Sinopse (opcional)"></textarea>
                <button class="btn-primary" type="submit">Adicionar mídia</button>
            </form></div>
            <div class="settings-group"><div class="settings-group-title">Usuários</div><div class="admin-card">
                <div class="admin-search"><input id="admin-user-search" placeholder="Buscar por nome, usuário ou e-mail"><button id="admin-search-btn" class="help-btn" type="button">Buscar</button></div>
                <div id="admin-users-results" class="admin-users-results"></div>
            </div></div>
            <p id="admin-status" class="settings-save-status" aria-live="polite"></p>
        </section>`;

    const status = container.querySelector('#admin-status');
    const request = async (url, options = {}) => {
        const response = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...(options.headers || {}) } });
        const body = await response.json();
        if (!response.ok) throw new Error(body.error || 'Ação não concluída.');
        return body;
    };
    const setStatus = message => { status.textContent = message; };
    container.querySelector('#admin-back').addEventListener('click', () => window.navigateBack());
    container.querySelector('#admin-media-form').addEventListener('submit', async event => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(event.currentTarget));
        try { await request('/api/admin/media', { method: 'POST', body: JSON.stringify(values) }); event.currentTarget.reset(); setStatus('Mídia adicionada ao catálogo.'); }
        catch (error) { setStatus(error.message); }
    });
    const results = container.querySelector('#admin-users-results');
    async function searchUsers() {
        try {
            const users = await request(`/api/admin/users?q=${encodeURIComponent(container.querySelector('#admin-user-search').value.trim())}`);
            results.innerHTML = users.length ? users.map(user => `<article class="admin-user"><div><strong>${user.display_name || user.username}</strong><span>@${user.username} · ${user.role === 'admin' ? 'Administrador' : 'Usuário'}</span><small>${user.email}${user.is_banned ? ` · Banido${user.banned_reason ? `: ${user.banned_reason}` : ''}` : ''}</small></div>${user.role === 'user' ? `<button class="help-btn admin-ban-btn" data-id="${user.id}" data-banned="${user.is_banned ? 'true' : 'false'}">${user.is_banned ? 'Remover banimento' : 'Banir'}</button>` : ''}</article>`).join('') : '<p class="admin-empty">Nenhum usuário encontrado.</p>';
            results.querySelectorAll('.admin-ban-btn').forEach(button => button.addEventListener('click', async () => {
                const banned = button.dataset.banned !== 'true';
                const reason = banned ? window.prompt('Motivo do banimento (opcional):') : '';
                if (reason === null) return;
                try { await request('/api/admin/users/ban', { method: 'POST', body: JSON.stringify({ user_id: button.dataset.id, banned, reason }) }); setStatus(banned ? 'Usuário banido.' : 'Banimento removido.'); searchUsers(); }
                catch (error) { setStatus(error.message); }
            }));
        } catch (error) { setStatus(error.message); }
    }
    container.querySelector('#admin-search-btn').addEventListener('click', searchUsers);
    container.querySelector('#admin-user-search').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); searchUsers(); } });
}
