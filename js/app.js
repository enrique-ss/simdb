import { renderHomeView } from './views/home-view.js';
import { renderSearchView } from './views/search-view.js';
import { renderProfileView } from './views/profile-view.js';
import { renderImportExportView } from './views/import-export-view.js';
import { renderApoieView } from './views/apoie-view.js';
import { renderAuthView } from './views/auth-view.js';
import { openMediaDetailModal } from './views/media-detail-view.js';

window.openMediaDetailModal = openMediaDetailModal;

document.addEventListener('DOMContentLoaded', () => {
    const viewContainer = document.getElementById('view-container');
    const bottomNav = document.getElementById('bottom-nav');
    const navItems = document.querySelectorAll('.nav-item');
    const modal = document.getElementById('global-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // Verificar Sessão do Usuário
    function getSessionUser() {
        const sessionData = localStorage.getItem('kindred_session_user');
        return sessionData ? JSON.parse(sessionData) : null;
    }

    const views = {
        home: renderHomeView,
        search: renderSearchView,
        profile: renderProfileView,
        apoie: renderApoieView,
        'import-export': renderImportExportView,
        notifications: async (container) => {
            container.innerHTML = `
                <div class="section">
                    <h3 class="section-title" style="margin-bottom: 16px;">Notificações</h3>
                    <p style="color: var(--text-secondary); text-align: center; padding: 40px 0;">Nenhuma notificação nova no momento.</p>
                </div>
            `;
        },
        settings: async (container) => {
            const user = getSessionUser();
            container.innerHTML = `
                <div class="section">
                    <h3 class="section-title" style="margin-bottom: 16px;">Configurações</h3>
                    <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
                        <div style="font-weight: 700; margin-bottom: 8px;">Conta: @${user ? user.username : ''}</div>
                        <label style="font-size: 0.85rem; color: var(--text-secondary); display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                            <input type="checkbox"> Conta Privada
                        </label>
                    </div>
                    <button id="logout-btn" style="width: 100%; background: var(--heart-red); color: white; border: none; padding: 12px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer;">
                        🚪 Sair da Conta
                    </button>
                </div>
            `;

            container.querySelector('#logout-btn').addEventListener('click', () => {
                localStorage.removeItem('kindred_session_user');
                window.location.reload();
            });
        }
    };

    async function navigateTo(viewName) {
        const currentUser = getSessionUser();

        // Se não houver usuário logado no banco zerado, exibe obrigatoriamente a Tela de Cadastro (Figma exact match)
        if (!currentUser) {
            bottomNav.style.display = 'none';
            renderAuthView(viewContainer, 'register');
            return;
        }

        bottomNav.style.display = 'flex';
        if (!views[viewName]) viewName = 'home';

        navItems.forEach(item => {
            if (item.dataset.view === viewName) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        viewContainer.innerHTML = '<div style="padding: 60px 0; text-align: center; color: var(--text-secondary);">Carregando...</div>';
        await views[viewName](viewContainer);
        window.scrollTo(0, 0);
    }

    window.navigateTo = navigateTo;

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const target = item.dataset.view;
            if (target) navigateTo(target);
        });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });

    navigateTo('home');
});
