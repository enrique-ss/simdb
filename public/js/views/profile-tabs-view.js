import { getCurrentUserProfile, getUserProgress, getUserLists, getMediaReviews, getToken } from '../supabase-client.js';

export async function renderProfileTab(container, tabName = 'feed', options = null) {
    const user = await getCurrentUserProfile();
    if (!user) return;

    const progressList = await getUserProgress();
    const lists = await getUserLists();

    let tabContent = '';

    if (tabName === 'feed') {
        const achievements = [
            progressList.length > 0 && 'Primeira mídia registrada',
            progressList.length >= 10 && 'Biblioteca em expansão'
        ].filter(Boolean);

        tabContent = `
            <div class="section">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; font-weight:700;">Feed de Atividades</h4>
                ${progressList.length > 0 ? progressList.map(item => {
                    let progText = item.progress_text;
                    if (!progText) {
                        if (item.media_type === 'series') {
                            progText = `Temporada ${item.current_season || 1} • Episódio ${item.current_episode || 1}`;
                        } else if (item.media_type === 'book') {
                            progText = `Capítulo ${item.current_chapter || 1}`;
                        } else {
                            progText = 'Progresso atualizado';
                        }
                    }

                    return `
                        <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 10px; display: flex; gap: 12px; align-items: center;">
                            <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" style="width: 48px; height: 72px; object-fit: cover; border-radius: 6px;">
                            <div>
                                <div style="font-size: 0.85rem; font-weight: 700; color: white;">${item.title}</div>
                                <div style="font-size: 0.78rem; color: #E2D5FC; margin-top: 2px;">${progText}</div>
                                <div style="font-size: 0.75rem; color: var(--accent-purple); font-weight: 700; margin-top: 4px;">Status: Em andamento</div>
                            </div>
                        </div>
                    `;
                }).join('') : `
                    <div style="text-align: center; color: var(--text-muted); padding: 40px 0; font-size: 0.88rem;">
                        Nenhuma atividade recente no feed.
                    </div>
                `}
                ${achievements.length > 0 ? `
                    <div style="margin-top: 20px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 10px; font-weight:700;">Conquistas</h4>
                        ${achievements.map(title => `
                            <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 8px; font-size: .85rem; font-weight: 700; color: white;">${title}</div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    } else if (tabName === 'biblioteca') {
        tabContent = `
            <div class="section">
                <div style="display: flex; gap: 8px; margin-bottom: 16px; overflow-x: auto; padding-bottom: 4px;">
                    <button class="category-card-btn lib-sub-tab active" data-sub="all" style="padding: 6px 12px; font-size: 0.8rem; border: 1px solid var(--accent-purple);">Todas</button>
                    <button class="category-card-btn lib-sub-tab" data-sub="series" style="padding: 6px 12px; font-size: 0.8rem;">Séries</button>
                    <button class="category-card-btn lib-sub-tab" data-sub="movie" style="padding: 6px 12px; font-size: 0.8rem;">Filmes</button>
                    <button class="category-card-btn lib-sub-tab" data-sub="game" style="padding: 6px 12px; font-size: 0.8rem;">Jogos</button>
                    <button class="category-card-btn lib-sub-tab" data-sub="book" style="padding: 6px 12px; font-size: 0.8rem;">Leitura</button>
                </div>
                <div id="lib-items-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <!-- Preenchido via renderGrid() -->
                </div>
            </div>
        `;
    } else if (tabName === 'diario') {
        tabContent = `
            <div class="section">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; font-weight:700;">Diário de Consumo</h4>
                ${progressList.length > 0 ? progressList.map(item => `
                    <div style="background: var(--bg-card); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; color: white; font-size: 0.9rem;">${item.title}</div>
                            <div style="font-size: 0.78rem; color: #E2D5FC;">${item.progress_text || 'Em andamento'}</div>
                        </div>
                        <div style="font-size: 0.8rem; background: rgba(142, 91, 238, 0.2); color: var(--accent-purple); padding: 4px 10px; border-radius: 20px; font-weight: 700;">Registrado</div>
                    </div>
                `).join('') : '<div style="color: var(--text-muted); text-align: center; padding: 40px 0;">Nenhum registro no diário.</div>'}
            </div>
        `;
    } else if (tabName === 'listas') {
        tabContent = `
            <div class="section">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <h4 style="color: var(--text-primary); font-weight:700;">Minhas Listas</h4>
                    <button id="create-list-btn" class="btn-edit-profile" style="padding: 6px 12px; font-size: 0.8rem;">+ Criar Lista</button>
                </div>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    ${lists.length > 0 ? lists.map(l => `
                        <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                            <div style="font-weight: 700; color: white;">${l.title}</div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">${l.description || 'Sem descrição.'}</div>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); text-align: center; padding: 40px 0;">Você ainda não criou nenhuma lista.</div>'}
                </div>
            </div>
        `;
    } else if (tabName === 'avaliacoes') {
        tabContent = `
            <div class="section">
                <h4 style="color: var(--text-primary); margin-bottom: 12px; font-weight:700;">Minhas Avaliações</h4>
                <div style="color: var(--text-muted); text-align: center; padding: 40px 0;">
                    Nenhuma avaliação registrada até o momento.
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                <button id="back-to-profile-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white; text-transform: capitalize;">${tabName}</h3>
            </div>
            ${tabContent}
        </div>
    `;

    if (tabName === 'biblioteca') {
        const gridEl = container.querySelector('#lib-items-grid');
        const subBtns = container.querySelectorAll('.lib-sub-tab');

        function renderGrid(filterType = 'all') {
            const filtered = filterType === 'all' 
                ? progressList 
                : progressList.filter(item => item.media_type === filterType);

            if (filtered.length === 0) {
                gridEl.innerHTML = '<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px 0;">Nenhuma mídia nesta categoria.</div>';
                return;
            }

            gridEl.innerHTML = filtered.map(item => `
                <div class="poster-card">
                    <div class="poster-img-wrapper">
                        <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img">
                    </div>
                    <div class="poster-footer-pill">${item.progress_text || item.title}</div>
                </div>
            `).join('');
        }

        renderGrid('all');

        subBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                subBtns.forEach(b => {
                    b.classList.remove('active');
                    b.style.borderColor = 'transparent';
                });
                btn.classList.add('active');
                btn.style.borderColor = 'var(--accent-purple)';
                renderGrid(btn.dataset.sub);
            });
        });
    }

    const backBtn = container.querySelector('#back-to-profile-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.navigateBack) window.navigateBack();
            else window.navigateTo('profile');
        });
    }

    const createListBtn = container.querySelector('#create-list-btn');
    if (createListBtn) {
        createListBtn.addEventListener('click', async () => {
            const title = prompt("Digite o nome da sua nova lista:");
            if (title) {
                const token = getToken();
                await fetch('/api/lists', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ title, description: 'Lista criada pelo usuário' })
                });
                alert("Lista criada com sucesso!");
                renderProfileTab(container, 'listas');
            }
        });
    }
}
