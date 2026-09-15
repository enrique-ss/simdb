import { getApoieGoal } from '../supabase-client.js';

export async function renderApoieView(container) {
    const goal = await getApoieGoal();
    const percent = goal.target_amount ? Math.round((goal.current_amount / goal.target_amount) * 100) : 0;

    container.innerHTML = `
        <div class="section" style="padding-top: 16px;">
            <!-- Header com Botão Voltar -->
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <button class="nav-item" id="apoie-back-btn" style="font-size: 1.2rem; width: auto; height: auto; color: white;">‹</button>
                <h3 style="font-size: 1.1rem; font-weight: 700;">Apoie o Kindred</h3>
                <div style="width: 24px;"></div>
            </div>

            <p style="text-align: center; color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 24px; padding: 0 10px;">
                Seu apoio mantém o Kindred acessível e funcionando para todos.
            </p>

            <!-- Apoio Único -->
            <div style="margin-bottom: 24px;">
                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 4px;">Apoio único</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">Faça uma doação única de qualquer valor.</p>

                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-bottom: 12px;">
                    <button class="category-card-btn" style="flex-direction: column; padding: 10px 4px; justify-content: center; gap: 4px;">
                        <span style="font-size: 0.8rem;">R$ 5</span>
                    </button>
                    <button class="category-card-btn" style="flex-direction: column; padding: 10px 4px; justify-content: center; gap: 4px;">
                        <span style="font-size: 0.8rem;">R$ 10</span>
                    </button>
                    <button class="category-card-btn" style="flex-direction: column; padding: 10px 4px; justify-content: center; gap: 4px;">
                        <span style="font-size: 0.8rem;">R$ 15</span>
                    </button>
                    <button class="category-card-btn" style="flex-direction: column; padding: 10px 4px; justify-content: center; gap: 4px;">
                        <span style="font-size: 0.8rem;">R$ 20</span>
                    </button>
                    <button class="category-card-btn" style="flex-direction: column; padding: 10px 4px; justify-content: center; gap: 4px;">
                        <span style="font-size: 0.8rem;">Outro</span>
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                    <button class="category-card-btn" style="justify-content: center; padding: 12px 8px; font-size: 0.85rem;">
                        <span style="color: #32BCAD;">❖</span> Pix
                    </button>
                    <button class="category-card-btn" style="justify-content: center; padding: 12px 8px; font-size: 0.85rem;">
                        <span style="color: #003087;">P</span> Paypal
                    </button>
                    <button class="category-card-btn" style="justify-content: center; padding: 12px 8px; font-size: 0.85rem;">
                        <span style="color: #FF5E5B;">☕</span> Ko-fi
                    </button>
                </div>
            </div>

            <!-- Apoie Gratuitamente -->
            <div style="background: #14141E; border: 1px solid #242436; border-radius: var(--radius-lg); padding: 16px; margin-bottom: 16px;">
                <h4 style="font-size: 1rem; font-weight: 700; margin-bottom: 4px;">Apoie gratuitamente</h4>
                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 16px;">Não pode doar? Você ainda pode ajudar assistindo anúncios.</p>

                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; text-align: center;">
                    <div style="padding-right: 8px; border-right: 1px solid var(--border-color);">
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Ganhe conquistas exclusivas e participe do ranking.</div>
                    </div>
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Cada anúncio ajuda a manter o app no ar.</div>
                    </div>
                </div>

                <button class="category-card-btn" style="width: 100%; justify-content: space-between; background: #232332; border: none; padding: 14px 16px;">
                    <span style="font-weight: 700;">Assistir anúncio</span>
                    <span>›</span>
                </button>

                <div style="text-align: center; font-size: 0.75rem; color: var(--text-muted); margin-top: 10px;">
                    Você assistiu ${goal.ads_watched_count || 0} anúncios este mês.
                </div>
            </div>

            <!-- Meta Dinâmica do Banco de Dados SQLite -->
            <div style="background: #14141E; border: 1px solid #242436; border-radius: var(--radius-lg); padding: 16px;">
                <div style="display: flex; items-center; gap: 12px; margin-bottom: 12px;">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-secondary);">Nosso objetivo atual</div>
                        <div style="font-size: 0.95rem; font-weight: 700;">${goal.title}</div>
                    </div>
                </div>

                <div style="width: 100%; height: 8px; background: #222230; border-radius: 4px; overflow: hidden; margin-bottom: 8px;">
                    <div style="width: ${percent}%; height: 100%; background: var(--accent-purple);"></div>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary);">
                    <span>R$ ${goal.current_amount.toFixed(2)}</span>
                    <span>Faltam R$ ${(goal.target_amount - goal.current_amount).toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;

    const backBtn = container.querySelector('#apoie-back-btn');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.navigateTo('home');
        });
    }
}
