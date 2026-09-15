import { searchTMDB } from '../services/tmdb-service.js';
import { searchGames } from '../services/rawg-service.js';
import { searchBooks } from '../services/books-service.js';
import { getMediaByTag, searchUsers, sendFriendRequest } from '../supabase-client.js';

export async function renderSearchView(container) {
    const lancamentos = await getMediaByTag('lancamentos');
    const paraVoce = await getMediaByTag('para_voce');
    const aguardados = await getMediaByTag('aguardados');

    container.innerHTML = `
        <div class="section">
            <!-- Barra de Busca Pill -->
            <div class="search-input-wrapper">
                <span class="search-input-icon">⌕</span>
                <input type="text" id="search-input" class="search-pill-input" placeholder="Buscar mídias ou pessoas">
                <span class="search-filter-icon" id="filter-btn">≡</span>
            </div>

            <!-- Seção de Categorias Grid 2x2 -->
            <div style="margin-bottom: 20px;">
                <h3 class="section-title" style="margin-bottom: 12px;">Categorias</h3>
                <div class="category-grid">
                    <button class="category-card-btn" data-cat="movie">
                        <span>Filmes</span>
                    </button>
                    <button class="category-card-btn" data-cat="series">
                        <span>Séries</span>
                    </button>
                    <button class="category-card-btn" data-cat="game">
                        <span>Jogos</span>
                    </button>
                    <button class="category-card-btn" data-cat="book">
                        <span>Leitura</span>
                    </button>
                    <button class="category-card-btn" data-cat="people">
                        <span>Pessoas</span>
                    </button>
                </div>
            </div>

            <!-- Seção Lançamentos (100% Dinâmico do SQLite) -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Lançamentos</h3>
                    <span class="see-more-btn">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="lancamentos-scroll">
                    ${lancamentos.length > 0 ? lancamentos.map(item => `
                        <div class="poster-card" data-id="${item.id}"><img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img"></div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhum lançamento no momento.</div>'}
                </div>
            </div>

            <!-- Seção Para Você (100% Dinâmico do SQLite) -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Para você</h3>
                    <span class="see-more-btn">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="para-voce-scroll">
                    ${paraVoce.length > 0 ? paraVoce.map(item => `
                        <div class="poster-card" data-id="${item.id}"><img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img"></div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma recomendação no momento.</div>'}
                </div>
            </div>

            <!-- Seção Mais Aguardados (100% Dinâmico do SQLite) -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Mais aguardados</h3>
                    <span class="see-more-btn">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="aguardados-scroll">
                    ${aguardados.length > 0 ? aguardados.map(item => `
                        <div class="poster-card" data-id="${item.id}"><img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img"></div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhum título aguardado.</div>'}
                </div>
            </div>

            <!-- Container de Resultados da Pesquisa Ativa -->
            <div id="search-results-container" class="hidden" style="margin-top: 16px;">
                <h3 class="section-title" style="margin-bottom: 12px;">Resultados da Busca</h3>
                <div id="search-results" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;"></div>
            </div>
        </div>
    `;

    const searchInput = container.querySelector('#search-input');
    const resultsContainer = container.querySelector('#search-results');
    const resultsWrapper = container.querySelector('#search-results-container');
    const categoryBtns = container.querySelectorAll('.category-card-btn');

    async function doSearch(term, category = 'movie') {
        resultsWrapper.classList.remove('hidden');
        resultsContainer.innerHTML = `<div style="grid-column: 1 / -1; color: var(--text-secondary); text-align: center; padding: 20px;">Buscando...</div>`;

        let results = [];
        if (category === 'people') {
            results = await searchUsers(term);
            resultsContainer.style.gridTemplateColumns = '1fr';
            resultsContainer.innerHTML = results.length ? results.map(user => `
                <article class="user-search-card">
                    ${user.avatar_url ? `<img src="${user.avatar_url}" alt="">` : '<div class="user-search-avatar"></div>'}
                    <div><strong>${user.display_name || user.username}</strong><span>@${user.username}</span></div>
                    <button class="help-btn add-friend-btn" data-id="${user.id}">Adicionar</button>
                </article>`).join('') : '<div class="search-empty">Nenhuma pessoa encontrada.</div>';
            resultsContainer.querySelectorAll('.add-friend-btn').forEach(button => button.addEventListener('click', async () => {
                try { await sendFriendRequest(button.dataset.id); button.disabled = true; button.textContent = 'Solicitação enviada'; }
                catch (error) { button.textContent = error.message; }
            }));
            return;
        }
        resultsContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        if (category === 'movie' || category === 'series') {
            results = await searchTMDB(term || 'batman', category === 'series' ? 'tv' : 'movie');
        } else if (category === 'game') {
            results = await searchGames(term || 'witcher');
        } else if (category === 'book') {
            results = await searchBooks(term || 'hobbit');
        }

        resultsContainer.innerHTML = results.map(item => `
            <div class="poster-card" data-id="${item.id}">
                <div class="poster-img-wrapper">
                    <img src="${item.poster}" class="poster-img">
                </div>
                <div class="poster-footer-pill">${item.title}</div>
            </div>
        `).join('');

        resultsContainer.querySelectorAll('.poster-card').forEach((card, idx) => {
            card.addEventListener('click', () => {
                if (window.openMediaDetailModal && results[idx]) {
                    window.openMediaDetailModal(results[idx]);
                }
            });
        });
    }

    categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.dataset.cat;
            doSearch('', cat);
        });
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            doSearch(searchInput.value.trim());
        }
    });
}
