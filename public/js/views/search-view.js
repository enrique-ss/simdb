import { searchTMDB } from '../services/tmdb-service.js';
import { searchGames } from '../services/rawg-service.js';
import { searchBooks } from '../services/books-service.js';
import { getMediaByTag } from '../supabase-client.js';

export async function renderSearchView(container) {
    const lancamentos = await getMediaByTag('lancamentos');
    const paraVoce = await getMediaByTag('para_voce');
    const aguardados = await getMediaByTag('aguardados');

    container.innerHTML = `
        <div class="section">
            <!-- Barra de Busca Pill -->
            <div class="search-input-wrapper">
                <span class="search-input-icon">⌕</span>
                <input type="text" id="search-input" class="search-pill-input" placeholder="Buscar mídias">
                <span class="search-filter-icon" id="filter-btn">≡</span>
            </div>

            <!-- Seção de Categorias Grid 2x2 -->
            <div style="margin-bottom: 20px;">
                <h3 class="section-title" style="margin-bottom: 12px;">Categorias</h3>
                <div class="category-grid">
                    <button class="category-card-btn" data-cat="movie">
                        <svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
                        <span>Filmes</span>
                    </button>
                    <button class="category-card-btn" data-cat="series">
                        <svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="15" rx="2" ry="2"></rect><polyline points="17 2 12 7 7 2"></polyline></svg>
                        <span>Séries</span>
                    </button>
                    <button class="category-card-btn" data-cat="game">
                        <svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="12" x2="10" y2="12"></line><line x1="8" y1="10" x2="8" y2="14"></line><line x1="15" y1="13" x2="15.01" y2="13"></line><line x1="18" y1="11" x2="18.01" y2="11"></line><rect x="2" y="6" width="20" height="12" rx="2"></rect></svg>
                        <span>Jogos</span>
                    </button>
                    <button class="category-card-btn" data-cat="book">
                        <svg class="cat-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
                        <span>Leitura</span>
                    </button>
                </div>
            </div>

            <!-- Seção Lançamentos (100% Dinâmico do SQLite) -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Lançamentos</h3>
                    <span class="see-more-btn" id="see-more-lancamentos">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="lancamentos-scroll">
                    ${lancamentos.length > 0 ? lancamentos.map(item => `
                        <div class="poster-card" data-id="${item.id}">
                            <div class="poster-img-wrapper">
                                <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img">
                            </div>
                            <div class="poster-footer-pill">${item.title || 'Título'}</div>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhum lançamento no momento.</div>'}
                </div>
            </div>

            <!-- Seção Para Você (100% Dinâmico do SQLite) -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Para você</h3>
                    <span class="see-more-btn" id="see-more-para-voce">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="para-voce-scroll">
                    ${paraVoce.length > 0 ? paraVoce.map(item => `
                        <div class="poster-card" data-id="${item.id}">
                            <div class="poster-img-wrapper">
                                <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img">
                            </div>
                            <div class="poster-footer-pill">${item.title || 'Título'}</div>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhuma recomendação no momento.</div>'}
                </div>
            </div>

            <!-- Seção Mais Aguardados (100% Dinâmico do SQLite) -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Mais aguardados</h3>
                    <span class="see-more-btn" id="see-more-aguardados">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="aguardados-scroll">
                    ${aguardados.length > 0 ? aguardados.map(item => `
                        <div class="poster-card" data-id="${item.id}">
                            <div class="poster-img-wrapper">
                                <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img">
                            </div>
                            <div class="poster-footer-pill">${item.title || 'Título'}</div>
                        </div>
                    `).join('') : '<div style="color: var(--text-muted); font-size: 0.85rem;">Nenhum título aguardado.</div>'}
                </div>
            </div>

            <!-- Seção Comunidade -->
            <div class="section" style="padding: 0 0 16px 0;">
                <div class="section-header">
                    <h3 class="section-title">Comunidade</h3>
                    <span class="see-more-btn" id="see-more-comunidade">Ver mais</span>
                </div>
                <div class="horizontal-scroll" id="comunidade-scroll">
                    <div style="color: var(--text-muted); font-size: 0.85rem;">Explore perfis e atividades da comunidade.</div>
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

    // Adicionar funcionalidade aos botões "Ver mais"
    const seeMoreLancamentos = container.querySelector('#see-more-lancamentos');
    if (seeMoreLancamentos) seeMoreLancamentos.addEventListener('click', () => window.navigateTo('lancamentos'));

    const seeMoreParaVoce = container.querySelector('#see-more-para-voce');
    if (seeMoreParaVoce) seeMoreParaVoce.addEventListener('click', () => window.navigateTo('para-voce'));

    const seeMoreAguardados = container.querySelector('#see-more-aguardados');
    if (seeMoreAguardados) seeMoreAguardados.addEventListener('click', () => window.navigateTo('aguardados'));

    const seeMoreComunidade = container.querySelector('#see-more-comunidade');
    if (seeMoreComunidade) seeMoreComunidade.addEventListener('click', () => window.navigateTo('comunidade'));

    // Adicionar funcionalidade aos poster cards das seções
    const allPosterCards = container.querySelectorAll('.poster-card');
    allPosterCards.forEach(card => {
        card.addEventListener('click', () => {
            const mediaId = card.dataset.id;
            console.log('Card clicado, mediaId:', mediaId);
            console.log('openMediaDetailModal disponível:', typeof window.openMediaDetailModal);

            if (mediaId) {
                // Criar objeto de mídia básico para o modal
                const mediaItem = {
                    id: mediaId,
                    title: card.querySelector('.poster-footer-pill')?.textContent || 'Mídia',
                    poster: card.querySelector('.poster-img')?.src || '',
                    media_type: 'movie', // padrão, pode ser ajustado
                    release_year: '',
                    rating: '',
                    overview: ''
                };

                console.log('MediaItem criado:', mediaItem);

                // Importar e usar a função do modal diretamente
                import('../views/media-detail-view.js').then(module => {
                    module.openMediaDetailModal(mediaItem);
                }).catch(err => {
                    console.error('Erro ao importar modal:', err);
                    alert('Erro ao abrir detalhes da mídia');
                });
            }
        });
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            doSearch(searchInput.value.trim());
        }
    });
}
