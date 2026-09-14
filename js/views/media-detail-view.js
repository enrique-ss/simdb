import { BOOK_ICON_EMOJI } from '../config.js';
import { getMediaReviews, postReview } from '../supabase-client.js';

export async function openMediaDetailModal(mediaItem) {
    const modal = document.getElementById('global-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    let iconEmoji = "🎬";
    if (mediaItem.media_type === 'series') iconEmoji = "📺";
    if (mediaItem.media_type === 'game') iconEmoji = "🎮";
    if (mediaItem.media_type === 'book') iconEmoji = BOOK_ICON_EMOJI;

    titleEl.innerHTML = `${iconEmoji} ${mediaItem.title}`;

    const isSeries = mediaItem.media_type === 'series';
    const reviews = await getMediaReviews(mediaItem.id);

    let currentFeeling = 'liked';

    bodyEl.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <img src="${mediaItem.poster}" style="width: 100px; height: 150px; object-fit: cover; border-radius: var(--radius-md);">
            <div style="flex: 1;">
                <h4 style="font-size: 1.1rem; color: var(--text-primary); font-weight: 700;">${mediaItem.title}</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0;">
                    Lançamento: ${mediaItem.release_year || 'N/A'} | Nota: ⭐ ${mediaItem.rating || 'N/A'}
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; max-height: 80px; overflow-y: auto;">
                    ${mediaItem.overview || 'Sinopse não cadastrada.'}
                </p>
            </div>
        </div>

        ${isSeries ? `
            <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid var(--border-color);">
                <span style="font-size: 0.78rem; color: var(--accent-purple); font-weight: 700;">Nível de Avaliação da Série</span>
                <select id="series-level-select" class="search-pill-input" style="padding: 6px 12px; margin-top: 6px; font-size: 0.85rem;">
                    <option value="work">Obra Completa</option>
                    <option value="season">Temporada 1</option>
                    <option value="episode">Episódio 1</option>
                </select>
            </div>
        ` : ''}

        <!-- Avaliação de Estado (Gostou, Não Gostou, Indiferente) -->
        <div style="margin-bottom: 16px;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 8px;">Sua Avaliação:</label>
            <div style="display: flex; gap: 8px;">
                <button class="category-card-btn feeling-btn active-feeling" data-feeling="liked" style="flex: 1; justify-content: center;">👍 Gostou</button>
                <button class="category-card-btn feeling-btn" data-feeling="indifferent" style="flex: 1; justify-content: center;">😐 Indiferente</button>
                <button class="category-card-btn feeling-btn" data-feeling="disliked" style="flex: 1; justify-content: center;">👎 Não Gostou</button>
            </div>
        </div>

        <!-- Formulário de Comentário e Review -->
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.85rem; font-weight: 700;">Comentário / Review:</label>
                <label style="font-size: 0.78rem; color: var(--heart-red); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                    <input type="checkbox" id="spoiler-check"> Spoiler
                </label>
            </div>
            <textarea id="review-text-input" class="search-pill-input" rows="3" placeholder="Escreva o que achou..." style="border-radius: var(--radius-md);"></textarea>
            <button class="btn-edit-profile" id="submit-review-btn" style="width: 100%; margin-top: 8px; padding: 12px;">Publicar Avaliação</button>
        </div>

        <!-- Comentários da Comunidade do Banco SQLite -->
        <div>
            <h5 style="font-size: 0.9rem; font-weight: 700; margin-bottom: 8px; color: var(--text-secondary);">Avaliações da Comunidade</h5>
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${reviews.length > 0 ? reviews.map(rev => `
                    <div style="background: var(--bg-primary); padding: 10px; border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 0.82rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong>@${rev.friend_name || 'usuario'}</strong>
                            <span style="font-size: 0.75rem; color: var(--star-gold);">★ ${rev.rating || 5.0}</span>
                        </div>
                        <p style="margin-top: 4px; color: var(--text-primary);">${rev.review_text || 'Sem comentário.'}</p>
                    </div>
                `).join('') : '<div style="color: var(--text-muted); font-size: 0.8rem;">Seja o primeiro a avaliar esta mídia!</div>'}
            </div>
        </div>
    `;

    modal.classList.remove('hidden');

    const feelingBtns = bodyEl.querySelectorAll('.feeling-btn');
    feelingBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            feelingBtns.forEach(b => b.style.borderColor = 'var(--border-color)');
            btn.style.borderColor = 'var(--accent-purple)';
            currentFeeling = btn.dataset.feeling;
        });
    });

    const submitReviewBtn = bodyEl.querySelector('#submit-review-btn');
    submitReviewBtn.addEventListener('click', async () => {
        const text = bodyEl.querySelector('#review-text-input').value.trim();
        const isSpoiler = bodyEl.querySelector('#spoiler-check').checked;

        await postReview({
            media_id: mediaItem.id,
            media_title: mediaItem.title,
            media_type: mediaItem.media_type,
            feeling: currentFeeling,
            rating: 5.0,
            review_text: text,
            is_spoiler: isSpoiler
        });

        alert("Avaliação salva com sucesso no banco de dados!");
        modal.classList.add('hidden');
    });
}
