import { getFriendsActivities, getUserProgress, getAllUserSuggestions, sendFriendRequest, getToken } from '../supabase-client.js';

export async function renderAmigosView(container) {
    const token = getToken();
    let friendsData = { friends: [], pendingIncoming: [], pendingOutgoing: [] };
    let suggestions = [];

    try {
        if (token) {
            const res = await fetch('/api/friends', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            friendsData = await res.json();
            suggestions = await getAllUserSuggestions();
        }
    } catch (e) {
        console.error("Erro ao carregar amizades:", e);
    }

    let activeTab = 'sugestoes'; // padrão: Sugestões

    function renderContent() {
        let tabBodyHtml = '';

        if (activeTab === 'amigos') {
            tabBodyHtml = `
                <h4 style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">CONEXÕES MÚTUAS (${friendsData.friends.length})</h4>
                ${friendsData.friends.length > 0 ? `
                    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px 10px;">
                        ${friendsData.friends.map(f => `
                            <div class="user-card-item" data-id="${f.id}" style="display: flex; flex-direction: column; align-items: center; text-align: center; cursor: pointer;">
                                ${f.avatar_url ? `<img src="${f.avatar_url}" style="width: 60px; height: 60px; border-radius: 50%; object-fit: cover; margin-bottom: 6px; border: 2px solid var(--accent-purple);">` : `<div style="width: 60px; height: 60px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 27px; flex-shrink: 0; margin-bottom: 6px; border: 2px solid var(--accent-purple);">${(f.display_name || f.username || 'U')[0].toUpperCase()}</div>`}
                                <span style="font-weight: 800; color: white; font-size: 0.82rem; line-height: 1.1;">${f.display_name || f.username}</span>
                                <span style="font-size: 0.68rem; color: var(--text-muted); margin-top: 2px;">@${f.username}</span>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <div style="text-align: center; padding: 60px 20px 40px;">
                        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.8;">☹️</div>
                        <h3 style="font-weight: 800; font-size: 1.1rem; color: white; margin-bottom: 8px;">Você ainda não tem nenhum amigo!</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4; max-width: 300px; margin: 0 auto;">
                            Confira os usuários cadastrados na aba de sugestões para fazer conexões!
                        </p>
                    </div>
                `}
            `;
        } else if (activeTab === 'pedidos') {
            tabBodyHtml = `
                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 0.78rem; font-weight: 800; color: #E2D5FC; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">SOLICITAÇÕES PENDENTES (${friendsData.pendingIncoming.length})</h4>
                    ${friendsData.pendingIncoming.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${friendsData.pendingIncoming.map(p => `
                                <div style="background: #14141A; padding: 12px; border-radius: 12px; border: 1px solid #242430; display: flex; align-items: center; justify-content: space-between;">
                                    <div class="user-card-item" data-id="${p.id}" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                                        ${p.avatar_url ? `<img src="${p.avatar_url}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover; ">` : `<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; flex-shrink: 0; ">${(f.display_name || f.username || 'U')[0].toUpperCase()}</div>`}
                                        <div>
                                            <div style="font-weight: 700; color: white; font-size: 0.88rem;">${p.display_name || p.username}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">@${p.username}</div>
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 8px;">
                                        <button class="accept-rel-btn" data-id="${p.relationship_id}" style="background: var(--accent-purple); color: white; border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer;">Aceitar</button>
                                        <button class="reject-rel-btn" data-id="${p.relationship_id}" style="background: #242430; color: var(--text-secondary); border: none; padding: 7px 14px; border-radius: 8px; font-size: 0.78rem; cursor: pointer;">Recusar</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma solicitação pendente.</p>'}
                </div>
            `;
        } else {
            // sugestoes / todos os usuários cadastrados
            tabBodyHtml = `
                <h4 style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px;">TODOS OS USUÁRIOS CADASTRADOS (${suggestions.length})</h4>
                ${suggestions.length > 0 ? `
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${suggestions.map(u => {
                            let btnText = '+ Adicionar';
                            let btnDisabled = false;
                            if (u.relationshipStatus === 'accepted') {
                                btnText = 'Amigos ✓';
                                btnDisabled = true;
                            } else if (u.relationshipStatus === 'pending_sent') {
                                btnText = 'Enviado';
                                btnDisabled = true;
                            } else if (u.relationshipStatus === 'pending_received') {
                                btnText = 'Aceitar';
                            }

                            return `
                                <div style="background: #14141A; padding: 12px; border-radius: 12px; border: 1px solid #242430; display: flex; align-items: center; justify-content: space-between;">
                                    <div class="user-card-item" data-id="${u.id}" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1;">
                                        ${u.avatar_url ? `<img src="${u.avatar_url}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; ">` : `<div style="width: 44px; height: 44px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 20px; flex-shrink: 0; ">${(f.display_name || f.username || 'U')[0].toUpperCase()}</div>`}
                                        <div>
                                            <div style="font-weight: 700; color: white; font-size: 0.9rem;">${u.display_name || u.username}</div>
                                            <div style="font-size: 0.75rem; color: var(--text-muted);">@${u.username}</div>
                                            ${u.bio ? `<div style="font-size: 0.72rem; color: var(--text-secondary); margin-top: 2px;">${u.bio}</div>` : ''}
                                        </div>
                                    </div>
                                    <button class="send-req-btn" data-id="${u.id}" ${btnDisabled ? 'disabled' : ''} style="background: ${u.relationshipStatus === 'accepted' ? '#242430' : 'var(--accent-purple)'}; color: white; border: none; padding: 8px 14px; border-radius: 8px; font-size: 0.78rem; font-weight: 700; cursor: pointer; min-width: 90px;">
                                        ${btnText}
                                    </button>
                                </div>
                            `;
                        }).join('')}
                    </div>
                ` : '<p style="color: var(--text-muted); font-size: 0.85rem;">Nenhum usuário cadastrado no momento.</p>'}
            `;
        }

        container.innerHTML = `
            <div class="section" style="padding: 0;">
                <!-- Header com Abas -->
                <div style="display: flex; gap: 16px; overflow-x: auto; padding: 14px 16px; border-bottom: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem; font-weight: 700;">
                    <span class="tab-item ${activeTab === 'sugestoes' ? 'active-tab' : ''}" data-tab="sugestoes" style="color: ${activeTab === 'sugestoes' ? 'white' : 'var(--text-muted)'}; border-bottom: ${activeTab === 'sugestoes' ? '2px solid white' : 'none'}; padding-bottom: 6px; cursor: pointer;">Comunidade / Sugestões</span>
                    <span class="tab-item ${activeTab === 'amigos' ? 'active-tab' : ''}" data-tab="amigos" style="color: ${activeTab === 'amigos' ? 'white' : 'var(--text-muted)'}; border-bottom: ${activeTab === 'amigos' ? '2px solid white' : 'none'}; padding-bottom: 6px; cursor: pointer;">Amigos (${friendsData.friends.length})</span>
                    <span class="tab-item ${activeTab === 'pedidos' ? 'active-tab' : ''}" data-tab="pedidos" style="color: ${activeTab === 'pedidos' ? 'white' : 'var(--text-muted)'}; border-bottom: ${activeTab === 'pedidos' ? '2px solid white' : 'none'}; padding-bottom: 6px; cursor: pointer; position: relative;">
                        Pedidos
                        ${friendsData.pendingIncoming.length > 0 ? `<span style="background: var(--heart-red); color: white; border-radius: 50%; padding: 2px 6px; font-size: 0.65rem; margin-left: 4px;">${friendsData.pendingIncoming.length}</span>` : ''}
                    </span>
                </div>

                <div style="padding: 16px;">
                    <!-- Busca em tempo real -->
                    <div style="margin-bottom: 20px;">
                        <div style="position: relative;">
                            <input type="text" id="friend-search-input" class="search-pill-input" placeholder="Buscar por @usuário..." style="padding-right: 40px; background: #14141A; border: 1px solid #242430; border-radius: 10px;">
                            <button id="friend-search-btn" aria-label="Buscar" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-secondary); font-size: 1.1rem; cursor: pointer;">⌕</button>
                        </div>
                        <div id="friend-search-results" style="margin-top: 10px; display: flex; flex-direction: column; gap: 8px;"></div>
                    </div>

                    <div id="tab-body-container">
                        ${tabBodyHtml}
                    </div>
                </div>
            </div>
        `;

        // Eventos de Abas
        container.querySelectorAll('.tab-item').forEach(tabBtn => {
            tabBtn.addEventListener('click', () => {
                activeTab = tabBtn.dataset.tab;
                renderContent();
            });
        });

        // Clique nos cards de usuário para abrir perfil
        container.querySelectorAll('.user-card-item').forEach(card => {
            card.addEventListener('click', () => {
                const uid = card.dataset.id;
                if (uid) window.navigateTo('profile', { userId: uid });
            });
        });

        // Botões de Enviar Solicitação
        container.querySelectorAll('.send-req-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const targetId = e.target.getAttribute('data-id');
                try {
                    e.target.innerText = "Enviando...";
                    e.target.disabled = true;
                    await sendFriendRequest(targetId);
                    e.target.innerText = "Enviado";
                } catch (err) {
                    alert(err.message);
                    e.target.innerText = "+ Adicionar";
                    e.target.disabled = false;
                }
            });
        });

        // Aceitar / Recusar
        container.querySelectorAll('.accept-rel-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const relId = e.target.getAttribute('data-id');
                try {
                    await fetch('/api/friends/accept', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ relationship_id: relId })
                    });
                    renderAmigosView(container);
                } catch (err) { console.error(err); }
            });
        });

        container.querySelectorAll('.reject-rel-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const relId = e.target.getAttribute('data-id');
                try {
                    await fetch('/api/friends/reject', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ relationship_id: relId })
                    });
                    renderAmigosView(container);
                } catch (err) { console.error(err); }
            });
        });

        // Busca
        const searchInput = container.querySelector('#friend-search-input');
        const searchResults = container.querySelector('#friend-search-results');
        const handleSearch = async () => {
            const query = searchInput.value.trim();
            if (!query) { searchResults.innerHTML = ''; return; }

            try {
                const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const users = await res.json();
                if (users.length === 0) {
                    searchResults.innerHTML = '<div style="font-size: 0.8rem; color: var(--text-muted); padding: 8px;">Nenhum usuário encontrado.</div>';
                    return;
                }
                searchResults.innerHTML = users.map(u => `
                    <div style="background: var(--bg-card); padding: 10px; border-radius: 8px; border: 1px solid var(--border-color); display: flex; align-items: center; justify-content: space-between;">
                        <div class="user-card-item" data-id="${u.id}" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                            ${u.avatar_url ? `<img src="${u.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; ">` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--accent-purple); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 14px; flex-shrink: 0; ">${(f.display_name || f.username || 'U')[0].toUpperCase()}</div>`}
                            <div>
                                <div style="font-weight: 700; color: white; font-size: 0.82rem;">${u.display_name || u.username}</div>
                                <div style="font-size: 0.7rem; color: var(--text-muted);">@${u.username}</div>
                            </div>
                        </div>
                        <button class="send-req-btn" data-id="${u.id}" style="background: var(--accent-purple); color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 0.75rem; font-weight: 700; cursor: pointer;">
                            + Adicionar
                        </button>
                    </div>
                `).join('');

                searchResults.querySelectorAll('.user-card-item').forEach(card => {
                    card.addEventListener('click', () => {
                        const uid = card.dataset.id;
                        if (uid) window.navigateTo('profile', { userId: uid });
                    });
                });
            } catch (err) {
                console.error(err);
            }
        };

        if (searchInput) searchInput.addEventListener('keyup', (e) => { if (e.key === 'Enter') handleSearch(); });
        const searchBtn = container.querySelector('#friend-search-btn');
        if (searchBtn) searchBtn.addEventListener('click', handleSearch);
    }

    renderContent();
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
                        <div class="poster-footer-pill">${item.progress_text || item.title}</div>
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
