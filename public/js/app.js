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
import { renderSettingsView } from './views/settings-view.js';
import { renderAdminView } from './views/admin-view.js';
import { renderCatalogListView } from './views/catalog-list-view.js';
import { getToken, getSessionUser, getCurrentUserProfile } from './supabase-client.js';

window.openMediaDetailModal = openMediaDetailModal;

document.addEventListener('DOMContentLoaded', () => {
    const viewContainer = document.getElementById('view-container');
    const bottomNav = document.getElementById('bottom-nav');
    const navItems = document.querySelectorAll('.nav-item');
    const modal = document.getElementById('global-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');

    let historyStack = [];

    const views = {
        home: renderHomeView,
        search: renderSearchView,
        profile: renderProfileView,
        'edit-profile': renderEditProfileView,
        apoie: renderApoieView,
        'import-export': renderImportExportView,
        'profile-feed': (container, params) => renderProfileTab(container, 'feed', params),
        'profile-biblioteca': (container, params) => renderProfileTab(container, 'biblioteca', params),
        'profile-diario': (container, params) => renderProfileTab(container, 'diario', params),
        'profile-listas': (container, params) => renderProfileTab(container, 'listas', params),
        'profile-avaliacoes': (container, params) => renderProfileTab(container, 'avaliacoes', params),
        estatisticas: renderStatsView,
        conquistas: renderConquistasView,
        'hall-fama': renderHallFamaView,
        amigos: renderAmigosView,
        blocked: renderBlockedView,
        language: renderLanguageView,
        continuar: renderFullContinuarView,
        lancamentos: (container) => renderCatalogListView(container, { title: 'Lançamentos', tag: 'lancamentos', emptyMessage: 'Nenhum lançamento no momento.' }),
        'para-voce': (container) => renderCatalogListView(container, { title: 'Para você', tag: 'para_voce', emptyMessage: 'Nenhuma recomendação no momento.' }),
        aguardados: (container) => renderCatalogListView(container, { title: 'Mais aguardados', tag: 'aguardados', emptyMessage: 'Nenhum título aguardado.' }),
        'novos-episodios': (container) => renderCatalogListView(container, { title: 'Novos episódios', tag: 'novos_episodios', emptyMessage: 'Nenhum novo episódio disponível no momento.' }),
        comunidade: renderAmigosView,
        favoritos: renderProfileView,
        notifications: async (container) => {
            const token = getToken();
            let notifs = [];
            try {
                if (token) {
                    const res = await fetch('/api/notifications', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    notifs = await res.json();
                }
            } catch (err) {
                console.error('Erro ao carregar notificações:', err);
            }

            container.innerHTML = `
                <div class="section" style="padding: 16px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Notificações</h3>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        ${notifs.length > 0 ? notifs.map(n => `
                            <div style="background: #14141C; padding: 14px; border-radius: 12px; border: 1px solid #242430; display: flex; align-items: flex-start; gap: 12px;">
                                <div style="flex: 1;">
                                    <div style="font-weight: 700; color: white; font-size: 0.88rem;">${n.title}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 2px;">${n.content}</div>
                                </div>
                            </div>
                        `).join('') : '<p style="color: var(--text-secondary); text-align: center; padding: 60px 0; font-size: 0.88rem;">Nenhuma notificação nova no momento.</p>'}
                    </div>
                </div>
            `;
        },
        settings: renderSettingsView,
        admin: renderAdminView
    };

    let socket = null;
    
    // Inicializar socket após obter usuário válido
    getCurrentUserProfile().then(user => {
        if (user && typeof io !== 'undefined') {
            socket = io();
            socket.emit('join', user.id);
            window.kindredSocket = socket;
        }
    });

    async function navigateTo(viewName, params = null, isBack = false) {
        // Se params for boolean (veio de isBack antigo)
        if (typeof params === 'boolean') {
            isBack = params;
            params = null;
        }

        const currentUser = await getCurrentUserProfile();

        if (!currentUser) {
            bottomNav.style.display = 'none';
            renderAuthView(viewContainer, 'login');
            return;
        }

        bottomNav.style.display = 'flex';
        document.documentElement.dataset.profileTheme = currentUser.profile_theme || 'violet';
        if (!views[viewName]) viewName = 'home';

        let targetHash = '#/' + viewName;
        if (viewName === 'profile' && params && params.userId) {
            targetHash = '#/profile/' + params.userId;
        } else if (params && typeof params === 'string') {
            targetHash = '#/' + viewName + '/' + params;
        }

        if (window.location.hash !== targetHash) {
            history.pushState(null, '', targetHash);
        }

        const navKey = viewName === 'comunidade' ? 'amigos' : viewName;
        navItems.forEach(item => {
            if (item.dataset.view === navKey) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        viewContainer.innerHTML = '<div style="padding: 60px 0; text-align: center; color: var(--text-secondary);">Carregando...</div>';
        try {
            await views[viewName](viewContainer, params);
        } catch (error) {
            console.error(`Erro ao renderizar a tela "${viewName}":`, error);
            viewContainer.innerHTML = `
                <div class="section" style="padding: 60px 16px; text-align: center;">
                    <p style="color: var(--text-secondary);">Não foi possível carregar esta tela.</p>
                    <button id="retry-view-btn" class="btn-edit-profile" style="margin-top: 16px;">Tentar novamente</button>
                </div>
            `;
            viewContainer.querySelector('#retry-view-btn').addEventListener('click', () => navigateTo(viewName, params, true));
        }
        window.scrollTo(0, 0);
    }

    function navigateBack() {
        if (window.history.length > 1) {
            window.history.back();
        } else {
            navigateTo('home');
        }
    }

    function parseHashAndNavigate() {
        const rawHash = window.location.hash || '';
        const hash = rawHash.replace(/^#\/?/, '');
        if (!hash) {
            navigateTo('home');
            return;
        }
        const parts = hash.split('/');
        const viewName = parts[0] || 'home';
        const paramId = parts[1] || null;

        if (viewName === 'profile' && paramId) {
            navigateTo('profile', { userId: paramId });
        } else {
            navigateTo(viewName, paramId ? { id: paramId } : null);
        }
    }

    window.navigateTo = navigateTo;
    window.navigateBack = navigateBack;

    window.addEventListener('popstate', () => {
        parseHashAndNavigate();
    });

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

    parseHashAndNavigate();
});
