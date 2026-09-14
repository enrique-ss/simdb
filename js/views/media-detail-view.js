import { BOOK_ICON_EMOJI } from '../config.js';

export function openMediaDetailModal(mediaItem) {
    const modal = document.getElementById('global-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    let iconEmoji = "🎬";
    if (mediaItem.media_type === 'series') iconEmoji = "📺";
    if (mediaItem.media_type === 'game') iconEmoji = "🎮";
    if (mediaItem.media_type === 'book') iconEmoji = BOOK_ICON_EMOJI;

    titleEl.innerHTML = `${iconEmoji} ${mediaItem.title}`;

    const isSeries = mediaItem.media_type === 'series';

    bodyEl.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <img src="${mediaItem.poster}" style="width: 110px; height: 160px; object-fit: cover; border-radius: var(--radius-md);">
            <div style="flex: 1;">
                <h4 style="font-size: 1.1rem; color: var(--text-primary);">${mediaItem.title}</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0;">
                    Lançamento: ${mediaItem.release_year || 'N/A'} | Nota: ⭐ ${mediaItem.rating || 'N/A'}
                </div>
                <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4;">
                    ${mediaItem.overview || 'Sem sinopse disponível.'}
                </p>
            </div>
        </div>

        <!-- RF-028 — Séries: Interação em Três Níveis (Obra, Temporada, Episódio) -->
        ${isSeries ? `
            <div style="background: var(--bg-primary); padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid var(--border-color);">
                <span style="font-size: 0.8rem; color: var(--accent-color); font-weight: 600;">Nível de Interação da Série (RF-028)</span>
                <div style="display: flex; gap: 8px; margin-top: 8px;">
                    <select id="series-level-select" class="input-field" style="padding: 6px; font-size: 0.85rem;">
                        <option value="work">Obra Completa</option>
                        <option value="season">Temporada 1</option>
                        <option value="episode">Episódio 1</option>
                    </select>
                </div>
            </div>
        ` : ''}

        <!-- RF-013 — Avaliação de Estado (Gostou, Não Gostou, Indiferente) -->
        <div style="margin-bottom: 16px;">
            <label style="font-size: 0.85rem; font-weight: 600; display: block; margin-bottom: 8px;">Sua Avaliação (RF-013):</label>
            <div style="display: flex; gap: 8px;">
                <button class="help-btn rating-feeling-btn" data-feeling="liked" style="flex: 1; justify-content: center;">👍 Gostou</button>
                <button class="help-btn rating-feeling-btn" data-feeling="indifferent" style="flex: 1; justify-content: center;">😐 Indiferente</button>
                <button class="help-btn rating-feeling-btn" data-feeling="disliked" style="flex: 1; justify-content: center;">👎 Não Gostou</button>
            </div>
        </div>

        <!-- RF-020 — Formulário de Comentário e Nota (0 a 5) -->
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.85rem; font-weight: 600;">Comentário / Review:</label>
                <label style="font-size: 0.8rem; color: var(--warning); display: flex; align-items: center; gap: 4px;">
                    <input type="checkbox" id="spoiler-check"> Marcar como Spoiler
                </label>
            </div>
            <textarea id="review-text-input" class="input-field" rows="3" placeholder="Escreva o que você achou..."></textarea>
            <button class="btn-primary" id="submit-review-btn" style="width: 100%; margin-top: 8px;">Publicar Avaliação</button>
        </div>

        <!-- Comentários da Comunidade e Moderação (RF-023) -->
        <div>
            <h5 style="font-size: 0.9rem; margin-bottom: 8px; color: var(--text-secondary);">Comentários Recentes</h5>
            <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); font-size: 0.85rem;">
                <div style="display: flex; justify-content: space-between;">
                    <strong>@lucas_m</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">Denunciar | Bloquear (RF-023)</span>
                </div>
                <p style="margin-top: 4px; color: var(--text-primary);">Excelente produção, vale muito a pena acompanhar!</p>
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    const feelingBtns = bodyEl.querySelectorAll('.rating-feeling-btn');
    feelingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            feelingBtns.forEach(b => b.style.borderColor = 'var(--border-color)');
            btn.style.borderColor = 'var(--accent-color)';
            btn.style.background = 'var(--accent-light)';
        });
    });

    const submitReviewBtn = bodyEl.querySelector('#submit-review-btn');
    submitReviewBtn.addEventListener('click', () => {
        alert("Avaliação salva com sucesso!");
        modal.classList.add('hidden');
    });
}
