import { getCurrentUserProfile, getUserProgress } from '../supabase-client.js';

export async function renderStatsView(container) {
    const user = await getCurrentUserProfile();
    const progressList = await getUserProgress();

    const seriesCount = progressList.filter(i => i.media_type === 'series').length;
    const moviesCount = progressList.filter(i => i.media_type === 'movie').length;
    const gamesCount = progressList.filter(i => i.media_type === 'game').length;
    const booksCount = progressList.filter(i => i.media_type === 'book').length;
    const totalCount = progressList.length;

    const calcPct = (cnt) => totalCount > 0 ? Math.round((cnt / totalCount) * 100) : 0;

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Estatísticas Detalhadas</h3>
            </div>

            <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
                <h4 style="font-size: 0.95rem; color: var(--accent-purple); font-weight: 700; margin-bottom: 14px;">Resumo Geral de Consumo</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; text-align: center; margin-bottom: 20px;">
                    <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <div style="font-size: 1.5rem; font-weight: 800; color: white;">${seriesCount}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Séries</div>
                    </div>
                    <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <div style="font-size: 1.5rem; font-weight: 800; color: white;">${moviesCount}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Filmes</div>
                    </div>
                    <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <div style="font-size: 1.5rem; font-weight: 800; color: white;">${gamesCount}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Jogos</div>
                    </div>
                    <div style="background: var(--bg-primary); padding: 14px; border-radius: 8px; border: 1px solid var(--border-color);">
                        <div style="font-size: 1.5rem; font-weight: 800; color: white;">${booksCount}</div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;">Livros / Obras</div>
                    </div>
                </div>

                <h5 style="font-size: 0.85rem; font-weight: 700; color: white; margin-bottom: 10px;">Distribuição de Mídias</h5>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Séries</span>
                            <span>${calcPct(seriesCount)}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${calcPct(seriesCount)}%; background: var(--accent-purple);"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Filmes</span>
                            <span>${calcPct(moviesCount)}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${calcPct(moviesCount)}%; background: #FFB6D9;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Jogos</span>
                            <span>${calcPct(gamesCount)}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${calcPct(gamesCount)}%; background: #87CEEB;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 4px;">
                            <span>Livros</span>
                            <span>${calcPct(booksCount)}%</span>
                        </div>
                        <div style="height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden;">
                            <div style="height: 100%; width: ${calcPct(booksCount)}%; background: #FFC107;"></div>
                        </div>
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
    const progressList = await getUserProgress();
    const count = progressList.length;

    const list = [
        { title: 'Primeiro Consumo', desc: 'Registre sua primeira mídia no Kindred', unlocked: count >= 1 },
        { title: 'Explorador Cultural', desc: 'Adicione 5 mídias à sua biblioteca', unlocked: count >= 5 },
        { title: 'Colecionador de Histórias', desc: 'Adicione 10 mídias à sua biblioteca', unlocked: count >= 10 },
        { title: 'Crítico Estreante', desc: 'Escreva sua primeira avaliação no aplicativo', unlocked: count >= 1 },
        { title: 'Maratonista', desc: 'Complete o acompanhamento de uma série', unlocked: count >= 3 }
    ];

    container.innerHTML = `
        <div class="section">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
                <button id="back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">←</button>
                <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Conquistas & Medalhas</h3>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${list.map(c => `
                    <div style="background: var(--bg-card); padding: 14px; border-radius: var(--radius-md); border: 1px solid ${c.unlocked ? 'var(--accent-purple)' : 'var(--border-color)'}; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-weight: 700; color: ${c.unlocked ? 'white' : 'var(--text-muted)'}; font-size: 0.9rem;">${c.title}</div>
                            <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px;">${c.desc}</div>
                        </div>
                        <span style="font-size: 0.78rem; font-weight: 700; color: ${c.unlocked ? 'var(--accent-purple)' : 'var(--text-muted)'}; background: ${c.unlocked ? 'rgba(255, 221, 243, 0.15)' : 'rgba(255,255,255,0.05)'}; padding: 4px 10px; border-radius: 20px;">
                            ${c.unlocked ? '🏆 Concluída' : '🔒 Bloqueada'}
                        </span>
                    </div>
                `).join('')}
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
                    <p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.4;">
                        Exiba os personagens mais marcantes das suas mídias favoritas no seu perfil.
                    </p>
                </div>
                <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color);">
                    <h4 style="color: var(--accent-purple); font-weight: 700; font-size: 0.95rem; margin-bottom: 8px;">Ships & Casais Favoritos</h4>
                    <p style="color: var(--text-secondary); font-size: 0.82rem; line-height: 1.4;">
                        Marque os relacionamentos e casais inesquecíveis da ficção.
                    </p>
                </div>
            </div>
        </div>
    `;

    container.querySelector('#back-btn').addEventListener('click', () => {
        if (window.navigateBack) window.navigateBack();
        else window.navigateTo('profile');
    });
}
