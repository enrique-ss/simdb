import { getFriendsActivities, getUserProgress } from '../supabase-client.js';

export async function renderAmigosView(container) {
    const activities = await getFriendsActivities();

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Amigos & Kindreds</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${activities.length > 0 ? activities.map(act => `
                    <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; align-items: center; gap: 12px;">
                        <img src="${act.friend_avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">
                        <div style="flex: 1;">
                            <div style="font-weight: 700; color: white; font-size: 0.9rem;">${act.friend_name || 'Amigo'}</div>
                            <div style="font-size: 0.78rem; color: var(--accent-purple); font-weight: 700; margin-top: 2px;">Afinidade: 85% Match</div>
                        </div>
                    </div>
                `).join('') : '<div style="color: var(--text-muted); text-align: center; padding: 40px 0;">Nenhum amigo ou kindred adicionado ainda.</div>'}
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('home');
    });
}

export async function renderBlockedView(container) {
    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Contas Bloqueadas</h3>
            </div>

            <div style="color: var(--text-muted); text-align: center; padding: 40px 0; font-size: 0.88rem;">
                Nenhuma conta bloqueada no momento.
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('settings');
    });
}

export async function renderLanguageView(container) {
    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Idioma e Região</h3>
            </div>

            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                <div style="margin-bottom: 12px;">
                    <label style="font-size: 0.82rem; color: var(--text-secondary); display: block; margin-bottom: 6px;">Idioma do Aplicativo:</label>
                    <select class="search-pill-input" style="padding: 8px 12px;">
                        <option value="pt-BR" selected>Português (Brasil)</option>
                        <option value="en-US">English (US)</option>
                        <option value="es-ES">Español</option>
                    </select>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('settings');
    });
}

export async function renderFullContinuarView(container) {
    const progressList = await getUserProgress();

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Continuar — Lista Completa</h3>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${progressList.length > 0 ? progressList.map(item => `
                    <div class="poster-card">
                        <div class="poster-img-wrapper">
                            <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img">
                        </div>
                        <div class="poster-footer-pill">${item.title}</div>
                    </div>
                `).join('') : '<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px 0;">Nenhum item em andamento.</div>'}
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('home');
    });
}
