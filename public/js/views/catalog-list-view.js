import { getMediaByTag } from '../supabase-client.js';
import { openMediaDetailModal } from './media-detail-view.js';

export async function renderCatalogListView(container, { title, tag, emptyMessage }) {
    const items = await getMediaByTag(tag);

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" aria-label="Voltar" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">${title}</h3>
            </div>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                ${items.length ? items.map(item => `
                    <button class="poster-card" data-id="${item.id}" style="border: 0; padding: 0; background: none; color: inherit; text-align: left; cursor: pointer;">
                        <div class="poster-img-wrapper">
                            <img src="${item.poster || 'https://via.placeholder.com/300x450?text=Capa'}" class="poster-img" alt="${item.title}">
                        </div>
                        <div class="poster-footer-pill">${item.title}</div>
                    </button>
                `).join('') : `<div style="grid-column: 1 / -1; color: var(--text-muted); text-align: center; padding: 40px 0;">${emptyMessage}</div>`}
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => window.navigateBack?.());
    container.querySelectorAll('.poster-card').forEach((card, index) => {
        card.addEventListener('click', () => openMediaDetailModal(items[index]));
    });
}
