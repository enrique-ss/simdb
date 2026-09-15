import { getFriendsActivities, getUserProgress } from '../supabase-client.js';

export async function renderAmigosView(container) {
    const sessionUser = JSON.parse(localStorage.getItem('kindred_session_user') || '{}');
    const userId = sessionUser.id;

    let friendsData = { friends: [], pendingIncoming: [], pendingOutgoing: [] };
    try {
        if (userId) {
            const res = await fetch(`/api/friends?user_id=${userId}`);
            friendsData = await res.json();
        }
    } catch (e) {
        console.error("Erro ao carregar amizades:", e);
    }

    container.innerHTML = `
        <div class="section" style="padding: 0;">
            <!-- Header com Abas em Scroll (Amigos.pdf) -->
            <div style="display: flex; gap: 16px; overflow-x: auto; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem; font-weight: 700;">
                <span style="color: white; border-bottom: 2px solid white; padding-bottom: 6px; cursor: pointer;">Amigos</span>
                <span style="color: var(--text-muted); cursor: pointer;">Seguindo</span>
                <span style="color: var(--text-muted); cursor: pointer;">Seguidores</span>
                <span style="color: var(--text-muted); cursor: pointer; position: relative;">
                    Pedidos
                    ${friendsData.pendingIncoming.length > 0 ? `<span style="background: var(--heart-red); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.65rem; margin-left: 4px;">${friendsData.pendingIncoming.length}</span>` : ''}
                </span>
                <span style="color: var(--text-muted); cursor: pointer;">Sugestões</span>
            </div>

            <div style="padding: 16px;">
                <!-- Busca de novos amigos -->
                <div style="margin-bottom: 20px;">
                    <div style="position: relative;">
                        <input type="text" id="friend-search-input" class="search-pill-input" placeholder="Buscar por filmes, séries, jogos, livros ou @usuário..." style="padding-right: 40px; background: #14141A; border: 1px solid #242430; border-radius: 10px;">
                        <button id="friend-search-btn" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); font-size: 1.1rem; cursor: pointer;">🔍</button>
                    </div>
                    <div id="friend-search-results" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;"></div>
                </div>

                <!-- Solicitações Recebidas Pendentes -->
                ${friendsData.pendingIncoming.length > 0 ? `
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 0.78rem; font-weight: 800; color: #E2D5FC; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">SOLICITAÇÕES PENDENTES (${friendsData.pendingIncoming.length})</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${friendsData.pendingIncoming.map(p => `
                                <div style="background: #14141A; padding: 12px; border-radius: 12px; border: 1px solid #242430; display: flex; align-items: center; justify-content: space-between;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <img src="${p.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                                        <div>
                                            <div style="font-weight: 700; color: white; font-size: 0.88rem;">${p.display_name || p.username}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">@${p.username}</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="accept-rel-btn" data-id="${p.relationship_id}" style="background: #5C5468; color: white; border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">Aceitar</button>
                                        <button class="reject-rel-btn" data-id="${p.relationship_id}" style="background: #242430; color: var(--text-secondary); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.78rem; cursor: pointer;">Recusar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}

                <!-- CONEXÕES MÚTUAS Grid / Lista de Amigos -->
                <h4 style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">CONEXÕES MÚTUAS (${friendsData.friends.length})</h4>

                ${friendsData.friends.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 10px;">
                        ${friendsData.friends.map(act => `
                            <div style="display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer;">
                                <img src="${act.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 6px; border: 2px solid transparent;">
                                <span style="font-weight: 800; color: white; font-size: 0.82rem; line-height: 1.1;">${act.display_name || act.username}</span>
                                <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">@${act.username}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <!-- Empty State idêntico ao Figma Amigos.pdf -->
                    <div style="text-align: center; padding: 60px 20px 40px; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.8;">☹️</div>
                        <h3 style="font-weight: 800; font-size: 1.1rem; color: white; margin-bottom: 8px;">Você ainda não tem nenhum amigo!</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; max-width: 300px;">
                            Convide um amigo para se juntar a você ou navegue por nossas escolhas na aba de sugestões.
                        </p>
                    </div>
                `}
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('home');
    });

    // Eventos de Busca
    const searchInput = container.querySelector('#friend-search-input');
    const searchResults = container.querySelector('#friend-search-results');

    const handleSearch = async () => {
        const query = searchInput.value.trim();
        if (!query) { searchResults.innerHTML = ''; return; }

        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}&user_id=${userId}`);
            const users = await res.json();
            if (users.length === 0) {
                searchResults.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px;">Nenhum usuário encontrado.</div>';
                return;
            }
            searchResults.innerHTML = users.map(u => `
                <div style="background: var(--bg-card); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <img src="${u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" style="width: 32px; height: 32px; border-radius: 50%;">
                        <div>
                            <div style="font-weight: 700; color: white; font-size: 0.82rem;">${u.display_name || u.username}</div>
                            <div style="font-size: 0.7rem; color: var(--text-muted);">Nível ${u.level || 1} • @${u.username}</div>
                        </div>
                    </div>
                    <button class="send-req-btn" data-id="${u.id}" style="background: var(--accent-purple); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
                        + Adicionar
                    </button>
                </div>
            `).join('');

            searchResults.querySelectorAll('.send-req-btn').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const targetId = e.target.getAttribute('data-id');
                    try {
                        const reqRes = await fetch('/api/friends/request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ user_id: userId, friend_id: targetId })
                        });
                        const reqData = await reqRes.json();
                        if (!reqRes.ok) throw new Error(reqData.error || "Erro ao solicitar amizade.");
                        e.target.innerText = "Enviado!";
                        e.target.disabled = true;
                    } catch (err) {
                        alert(err.message);
                    }
                });
            });
        } catch (err) {
            console.error(err);
        }
    };

    if (searchInput) searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleSearch(); });
    const searchBtn = container.querySelector('#friend-search-btn');
    if (searchBtn) searchBtn.addEventListener('click', handleSearch);

    // Eventos de Aceitar / Recusar
    container.querySelectorAll('.accept-rel-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const relId = e.target.getAttribute('data-id');
            try {
                const res = await fetch('/api/friends/accept', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ relationship_id: relId })
                });
                if (res.ok) renderAmigosView(container);
            } catch (err) { console.error(err); }
        });
    });

    container.querySelectorAll('.reject-rel-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const relId = e.target.getAttribute('data-id');
            try {
                const res = await fetch('/api/friends/reject', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ relationship_id: relId })
                });
                if (res.ok) renderAmigosView(container);
            } catch (err) { console.error(err); }
        });
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
