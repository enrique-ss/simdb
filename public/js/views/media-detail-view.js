import { getMediaReviews, postReview, addMediaToProgress } from '../supabase-client.js';

export async function openMediaDetailModal(mediaItem) {
    const modal = document.getElementById('global-modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');

    titleEl.textContent = mediaItem.title;

    const isSeries = mediaItem.media_type === 'series';
    const isBook = mediaItem.media_type === 'book';
    const reviews = await getMediaReviews(mediaItem.id);

    let currentFeeling = 'liked';

    bodyEl.innerHTML = `
        <div style="display: flex; gap: 16px; margin-bottom: 16px;">
            <img src="${mediaItem.poster || 'https://via.placeholder.com/300x450?text=Sem+Capa'}" style="width: 100px; height: 150px; object-fit: cover; border-radius: var(--radius-md);">
            <div style="flex: 1;">
                <h4 style="font-size: 1.1rem; color: var(--text-primary); font-weight: 700;">${mediaItem.title}</h4>
                <div style="font-size: 0.85rem; color: var(--text-secondary); margin: 4px 0;">
                    Lançamento: ${mediaItem.release_year || 'N/A'} | Nota: ${mediaItem.rating || 'N/A'}
                </div>
                <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.4; max-height: 80px; overflow-y: auto;">
                    ${mediaItem.overview || 'Sinopse não cadastrada.'}
                </p>
            </div>
        </div>

        <!-- Seletor de Progresso (Temporada/Episódio ou Capítulo) -->
        <div style="background: #181824; padding: 12px; border-radius: var(--radius-md); margin-bottom: 16px; border: 1px solid var(--border-color);">
            <span style="font-size: 0.82rem; color: var(--accent-purple); font-weight: 700; display: block; margin-bottom: 8px;">Definir Progresso no Continuar:</span>
            ${isSeries ? `
                <div style="display: flex; gap: 10px;">
                    <div style="flex: 1;">
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Temporada:</label>
                        <input type="number" id="progress-season-input" min="1" value="1" class="search-pill-input" style="padding: 6px 10px; font-size: 0.85rem; margin-top: 4px; border-radius: 6px;">
                    </div>
                    <div style="flex: 1;">
                        <label style="font-size: 0.75rem; color: var(--text-secondary);">Episódio:</label>
                        <input type="number" id="progress-episode-input" min="1" value="1" class="search-pill-input" style="padding: 6px 10px; font-size: 0.85rem; margin-top: 4px; border-radius: 6px;">
                    </div>
                </div>
            ` : isBook ? `
                <div>
                    <label style="font-size: 0.75rem; color: var(--text-secondary);">Capítulo / Página Atual:</label>
                    <input type="number" id="progress-chapter-input" min="1" value="1" class="search-pill-input" style="padding: 6px 10px; font-size: 0.85rem; margin-top: 4px; border-radius: 6px;">
                </div>
            ` : `
                <div style="font-size: 0.8rem; color: var(--text-secondary);">Marcar como em andamento / assistido</div>
            `}
            <button class="btn-edit-profile" id="add-to-progress-btn" style="width: 100%; margin-top: 10px; padding: 10px; background: rgba(142, 91, 238, 0.2); border: 1px solid var(--accent-purple);">Adicionar / Atualizar no Continuar</button>
        </div>

        <!-- Avaliação de Estado (Gostou, Não Gostou, Indiferente) -->
        <div style="margin-bottom: 16px;">
            <label style="font-size: 0.85rem; font-weight: 700; display: block; margin-bottom: 8px;">Sua Avaliação:</label>
            <div style="display: flex; gap: 8px;">
                <button class="category-card-btn feeling-btn active-feeling" data-feeling="liked" style="flex: 1; justify-content: center;">Gostou</button>
                <button class="category-card-btn feeling-btn" data-feeling="indifferent" style="flex: 1; justify-content: center;">Indiferente</button>
                <button class="category-card-btn feeling-btn" data-feeling="disliked" style="flex: 1; justify-content: center;">Não gostou</button>
            </div>
        </div>

        <!-- Formulário de Comentário e Review -->
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.85rem; font-weight: 700;">Comentário / Review:</label>
                <label style="font-size: 0.78rem; color: var(--heart-red); display: flex; align-items: center; gap: 4px; cursor: pointer;">
                    <input type="checkbox" id="spoiler-check" class="modern-checkbox"> Spoiler
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
                            <strong class="user-link-click" data-userid="${rev.user_id}" style="cursor: pointer; color: var(--accent-purple);">@${rev.friend_name || 'usuario'}</strong>
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

    const addToProgressBtn = bodyEl.querySelector('#add-to-progress-btn');
    if (addToProgressBtn) {
        addToProgressBtn.addEventListener('click', async () => {
            addToProgressBtn.disabled = true;
            addToProgressBtn.textContent = 'Salvando…';

            const seasonVal = bodyEl.querySelector('#progress-season-input')?.value || 1;
            const episodeVal = bodyEl.querySelector('#progress-episode-input')?.value || 1;
            const chapterVal = bodyEl.querySelector('#progress-chapter-input')?.value || 1;

            try {
                await addMediaToProgress({
                    media_id: mediaItem.id,
                    title: mediaItem.title,
                    media_type: mediaItem.media_type,
                    poster: mediaItem.poster,
                    current_season: parseInt(seasonVal),
                    current_episode: parseInt(episodeVal),
                    current_chapter: parseInt(chapterVal),
                    total_episodes: mediaItem.total_episodes || 10,
                    total_chapters: mediaItem.total_chapters || 100
                });
                alert("Mídia atualizada no Continuar!");
                modal.classList.add('hidden');
                if (window.location.hash.includes('home') || window.location.hash.includes('profile')) {
                    window.dispatchEvent(new Event('popstate'));
                }
            } catch (error) {
                alert(error.message || 'Não foi possível adicionar a mídia ao Continuar.');
                addToProgressBtn.disabled = false;
                addToProgressBtn.textContent = 'Adicionar / Atualizar no Continuar';
            }
        });
    }

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

        alert("Avaliação salva com sucesso!");
        modal.classList.add('hidden');
    });

    bodyEl.querySelectorAll('.user-link-click').forEach(el => {
        el.addEventListener('click', () => {
            const uid = el.dataset.userid;
            if (uid) {
                modal.classList.add('hidden');
                window.navigateTo('profile', { userId: uid });
            }
        });
    });
}
