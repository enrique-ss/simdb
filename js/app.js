import { renderHomeView } from './views/home-view.js';
import { renderSearchView } from './views/search-view.js';
import { renderProfileView } from './views/profile-view.js';
import { renderImportExportView } from './views/import-export-view.js';
import { renderApoieView } from './views/apoie-view.js';
import { renderAuthView } from './views/auth-view.js';
import { openMediaDetailModal } from './views/media-detail-view.js';
import { renderProfileTab } from './views/profile-tabs-view.js';
import { renderStatsView, renderConquistasView, renderHallFamaView } from './views/stats-conquistas-view.js';
import { renderAmigosView, renderBlockedView, renderLanguageView, renderFullContinuarView } from './views/social-settings-view.js';
import { renderEditProfileView } from './views/edit-profile-view.js';

window.openMediaDetailModal = openMediaDetailModal;

document.addEventListener('DOMContentLoaded', () => {
    const viewContainer = document.getElementById('view-container');
    const bottomNav = document.getElementById('bottom-nav');
    const navItems = document.querySelectorAll('.nav-item');
    const modal = document.getElementById('global-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let historyStack = [];

    function getSessionUser() {
        const sessionData = localStorage.getItem('kindred_session_user');
        return sessionData ? JSON.parse(sessionData) : null;
    }

    const views = {
        home: renderHomeView,
        search: renderSearchView,
        profile: renderProfileView,
        'edit-profile': renderEditProfileView,
        apoie: renderApoieView,
        'import-export': renderImportExportView,
        'profile-feed': (container) => renderProfileTab(container, 'feed'),
        'profile-biblioteca': (container) => renderProfileTab(container, 'biblioteca'),
        'profile-diario': (container) => renderProfileTab(container, 'diario'),
        'profile-listas': (container) => renderProfileTab(container, 'listas'),
        'profile-avaliacoes': (container) => renderProfileTab(container, 'avaliacoes'),
        estatisticas: renderStatsView,
        conquistas: renderConquistasView,
        'hall-fama': renderHallFamaView,
        amigos: renderAmigosView,
        blocked: renderBlockedView,
        language: renderLanguageView,
        'continuar-full': renderFullContinuarView,
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
                    <div style="background: var(--bg-card); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px;">
                        <div style="font-weight: 700;">Conta: @${user ? user.username : ''}</div>
                        
                        <button id="opt-blocked" style="background: none; border: none; color: white; text-align: left; padding: 8px 0; font-size: 0.9rem; cursor: pointer; border-bottom: 1px solid var(--border-color);">
                            🚫 Contas Bloqueadas
                        </button>
                        <button id="opt-language" style="background: none; border: none; color: white; text-align: left; padding: 8px 0; font-size: 0.9rem; cursor: pointer; border-bottom: 1px solid var(--border-color);">
                            🌐 Idioma e Região
                        </button>
                        <button id="opt-import" style="background: none; border: none; color: white; text-align: left; padding: 8px 0; font-size: 0.9rem; cursor: pointer;">
                            📦 Importar e Exportar Dados
                        </button>
                    </div>
                    <button id="logout-btn" style="width: 100%; background: var(--heart-red); color: white; border: none; padding: 12px; border-radius: var(--radius-md); font-weight: 700; cursor: pointer;">
                        🚪 Sair da Conta
                    </button>
                </div>
            `;

            container.querySelector('#opt-blocked').addEventListener('click', () => navigateTo('blocked'));
            container.querySelector('#opt-language').addEventListener('click', () => navigateTo('language'));
            container.querySelector('#opt-import').addEventListener('click', () => navigateTo('import-export'));

            container.querySelector('#logout-btn').addEventListener('click', () => {
                localStorage.removeItem('kindred_session_user');
                window.location.reload();
            });
        }
    };

    async function navigateTo(viewName, isBack = false) {
        const currentUser = getSessionUser();

        if (!currentUser) {
            bottomNav.style.display = 'none';
            renderAuthView(viewContainer, 'register');
            return;
        }

        bottomNav.style.display = 'flex';
        if (!views[viewName]) viewName = 'home';

        if (!isBack && historyStack[historyStack.length - 1] !== viewName) {
            historyStack.push(viewName);
        }

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

    function navigateBack() {
        if (historyStack.length > 1) {
            historyStack.pop();
            const previousView = historyStack[historyStack.length - 1];
            navigateTo(previousView, true);
        } else {
            navigateTo('home');
        }
    }

    window.navigateTo = navigateTo;
    window.navigateBack = navigateBack;

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
