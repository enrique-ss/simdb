import { getCurrentUserProfile, getUserProgress } from '../supabase-client.js';

export async function renderStatsView(container) {
    const user = await getCurrentUserProfile();

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Estatísticas Detalhadas</h3>
            </div>

            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
                <h4 style="font-size: 0.95rem; color: var(--accent-purple); font-weight: 700; margin-bottom: 12px;">Resumo Geral de Consumo</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: center;">
                    <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 1.4rem; font-weight: 800; color: white;">${user ? user.series_count : 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Séries Assistidas</div>
                    </div>
                    <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 1.4rem; font-weight: 800; color: white;">${user ? user.movies_count : 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Filmes Assistidos</div>
                    </div>
                    <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 1.4rem; font-weight: 800; color: white;">${user ? user.games_count : 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Jogos Jogados</div>
                    </div>
                    <div style="background: var(--bg-primary); padding: 12px; border-radius: 8px;">
                        <div style="font-size: 1.4rem; font-weight: 800; color: white;">${user ? user.works_count : 0}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Livros Lidos</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('profile');
    });
}

export async function renderConquistasView(container) {
    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Conquistas & Medalhas</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; gap: 12px; align-items: center;">
                    <div style="font-size: 2rem;">🏆</div>
                    <div>
                        <div style="font-weight: 700; color: white; font-size: 0.9rem;">Primeiro Consumo</div>
                        <div style="font-size: 0.78rem; color: var(--text-secondary);">Registre sua primeira mídia no Kindred</div>
                    </div>
                </div>
                <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; gap: 12px; align-items: center;">
                    <div style="font-size: 2rem;">🌟</div>
                    <div>
                        <div style="font-weight: 700; color: white; font-size: 0.9rem;">Crítico Estreante</div>
                        <div style="font-size: 0.78rem; color: var(--text-secondary);">Escreva sua primeira avaliação de uma mídia</div>
                    </div>
                </div>
                <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); display: flex; gap: 12px; align-items: center;">
                    <div style="font-size: 2rem;">🔥</div>
                    <div>
                        <div style="font-weight: 700; color: white; font-size: 0.9rem;">Maratonista</div>
                        <div style="font-size: 0.78rem; color: var(--text-secondary);">Complete uma temporada em menos de 7 dias</div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('profile');
    });
}

export async function renderHallFamaView(container) {
    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Hall da Fama</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 14px;">
                <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h4 style="color: var(--accent-purple); font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">Personagens Favoritos</h4>
                    <p style="color: var(--text-muted); font-size: 0.82rem;">Adicione seus personagens preferidos da cultura pop ao seu Hall da Fama.</p>
                </div>
                <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h4 style="color: var(--accent-purple); font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">Ships & Casais Favoritos</h4>
                    <p style="color: var(--text-muted); font-size: 0.82rem;">Marque seus casais inesquecíveis da ficção.</p>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('profile');
    });
}
