import { searchTMDB } from '../services/tmdb-service.js';
import { searchGames } from '../services/rawg-service.js';
import { searchBooks } from '../services/books-service.js';
import { BOOK_ICON_EMOJI } from '../config.js';

export async function renderSearchView(container) {
    container.innerHTML = `
        <div class="section">
            <!-- Barra de Busca Pill (Figma exact match) -->
            <div class="search-input-wrapper">
                <span class="search-input-icon">🔍</span>
                <input type="text" id="search-input" class="search-pill-input" placeholder="Buscar por filmes, séries, jogos, livros...">
                <span class="search-filter-icon" id="filter-btn">≡</span>
            </div>

            <!-- Seção de Categorias Grid 2x2 (Figma exact match) -->
            <div style="margin-bottom: 20px;">
                <h3 class="section-title" style="margin-bottom: 12px;">Categorias</h3>
                <div class="category-grid">
                    <button class="category-card-btn" data-cat="movie">
                        <span class="cat-icon">🎬</span>
                        <span>Filmes</span>
                    </button>
                    <button class="category-card-btn" data-cat="series">
                        <span class="cat-icon">📺</span>
                        <span>Séries</span>
                    </button>
                    <button class="category-card-btn" data-cat="game">
                        <span class="cat-icon">🎮</span>
                        <span>Jogos</span>
                    </button>
                    <button class="category-card-btn" data-cat="book">
                        <span class="cat-icon">${BOOK_ICON_EMOJI}</span>
                        <span>Leitura</span>
                    </button>
                </div>
            </div>

            <!-- Seção Lançamentos -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Lançamentos</h3>
                    <span class="see-more-btn">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="lancamentos-scroll">
                    <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg" class="poster-img"></div>
                    <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" class="poster-img"></div>
                    <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg" class="poster-img"></div>
                </div>
            </div>

            <!-- Seção Para Você -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Para você</h3>
                    <span class="see-more-btn">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="para-voce-scroll">
                    <div class="poster-card"><img src="https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=500" class="poster-img"></div>
                    <div class="poster-card"><img src="https://covers.openlibrary.org/b/id/8311916-M.jpg" class="poster-img"></div>
                    <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1eeYw0.jpg" class="poster-img"></div>
                </div>
            </div>

            <!-- Seção Mais Aguardados -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Mais aguardados</h3>
                    <span class="see-more-btn">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="aguardados-scroll">
                    <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg" class="poster-img"></div>
                    <div class="poster-card"><img src="https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg" class="poster-img"></div>
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
