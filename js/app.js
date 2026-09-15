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
            const user = getSessionUser();
            let notifs = [];
            try {
                if (user) {
                    const res = await fetch(`/api/notifications?user_id=${user.id}`);
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
                                <div style="font-size: 1.4rem;">${n.type === 'friend_request' ? '🤝' : n.type === 'chat' ? '💬' : '🔔'}</div>
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
        settings: async (container) => {
            const user = getSessionUser();
            container.innerHTML = `
                <div class="section" style="padding: 16px;">
                    <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 20px;">
                        <button id="settings-back-btn" style="background: none; border: none; color: white; font-size: 1.4rem; cursor: pointer;">‹</button>
                        <h3 style="font-weight: 800; font-size: 1.2rem; color: white;">Configurações</h3>
                    </div>

                    <!-- Banner Apoie o Kindred (Configurações.pdf) -->
                    <div class="apoie-banner-card" id="settings-apoie-card" style="margin: 0 0 24px 0;">
                        <div class="apoie-banner-left">
                            <div class="apoie-k-icon">K</div>
                            <div>
                                <div class="apoie-title">Apoie o Kindred</div>
                                <div class="apoie-sub">Assista um anúncio para contribuir, nos ajudando a manter o aplicativo ativo e funcionando.</div>
                            </div>
                        </div>
                        <div style="color: var(--text-secondary); font-size: 1.2rem;">›</div>
                    </div>

                    <!-- Grupo: Perfil -->
                    <div style="margin-bottom: 24px;">
                        <h4 style="font-size: 0.85rem; font-weight: 700; color: white; margin-bottom: 10px;">Perfil</h4>
                        <div style="background: #14141C; border-radius: 14px; border: 1px solid #242432; overflow: hidden;">
                            <div id="opt-color" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>🎨</span> Cor do perfil
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                            <div id="opt-blocked" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>👤</span> Contas bloqueadas
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>🛍️</span> Conta privada
                                </div>
                                <input type="checkbox" style="accent-color: var(--accent-purple); width: 18px; height: 18px; cursor: pointer;">
                            </div>
                            <div style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>📊</span> Estatísticas privadas
                                </div>
                                <input type="checkbox" style="accent-color: var(--accent-purple); width: 18px; height: 18px; cursor: pointer;">
                            </div>
                        </div>
                    </div>

                    <!-- Grupo: Personalização -->
                    <div style="margin-bottom: 28px;">
                        <h4 style="font-size: 0.85rem; font-weight: 700; color: white; margin-bottom: 10px;">Personalização</h4>
                        <div style="background: #14141C; border-radius: 14px; border: 1px solid #242432; overflow: hidden;">
                            <div id="opt-banner-home" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>🖼️</span> Banner da página inicial
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                            <div id="opt-banner-stats" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>📊</span> Banner da página de estatísticas
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                            <div id="opt-filter" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>🌪️</span> Filtro de mídia
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                            <div id="opt-language" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; border-bottom: 1px solid #242432; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>🌐</span> Idioma e região
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                            <div id="opt-notifications" style="display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; cursor: pointer;">
                                <div style="display: flex; align-items: center; gap: 12px; font-size: 0.9rem; font-weight: 600;">
                                    <span>🔔</span> Notificações
                                </div>
                                <span style="color: var(--text-muted);">›</span>
                            </div>
                        </div>
                    </div>

                    <button id="logout-btn" style="width: 100%; background: #2A1F26; color: var(--heart-red); border: 1px solid rgba(255,75,110,0.3); padding: 14px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; cursor: pointer;">
                        Sair da Conta
                    </button>
                </div>
            `;

            container.querySelector('#settings-back-btn').addEventListener('click', () => navigateBack());
            const apoieCard = container.querySelector('#settings-apoie-card');
            if (apoieCard) apoieCard.addEventListener('click', () => navigateTo('apoie'));

            container.querySelector('#opt-blocked').addEventListener('click', () => navigateTo('blocked'));
            container.querySelector('#opt-language').addEventListener('click', () => navigateTo('language'));

            container.querySelector('#logout-btn').addEventListener('click', () => {
                localStorage.removeItem('kindred_session_user');
                localStorage.removeItem('kindred_token');
                window.location.reload();
            });
        }
    };

    let socket = null;
    const initialUser = getSessionUser();
    if (initialUser && typeof io !== 'undefined') {
        socket = io();
        socket.emit('join', initialUser.id);
        window.kindredSocket = socket;
    }

    async function navigateTo(viewName, isBack = false) {
        const currentUser = getSessionUser();

        if (!currentUser) {
            bottomNav.style.display = 'none';
            renderAuthView(viewContainer, 'login');
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
