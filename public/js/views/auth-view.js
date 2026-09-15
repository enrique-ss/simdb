export function renderAuthView(container, initialScreen = 'login') {
    let currentScreen = initialScreen; // 'login' (padrão) ou 'register'

    function renderScreen() {
        if (currentScreen === 'register') {
            container.innerHTML = `
                <div class="section" style="min-height: 90vh; display: flex; flex-direction: column; justify-content: center; padding: 24px;">
                    <!-- Logo KINDRED (Figma exact match Cadastro.pdf) -->
                    <div style="text-align: center; margin-bottom: 28px;">
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 3.2rem; font-weight: 900; letter-spacing: -1px; color: #E5D4ED; text-transform: uppercase;">KINDRED</h1>
                    </div>

                    <!-- Formulário de Cadastro -->
                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                NOME DE EXIBIÇÃO
                            </label>
                            <div style="position: relative;">
                                <input type="text" id="reg-display-name" class="search-pill-input" placeholder="Nome de exibição">
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                NOME DE USUÁRIO (@HANDLE)
                            </label>
                            <div style="position: relative;">
                                <input type="text" id="reg-username" class="search-pill-input" placeholder="@usuário">
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                E-MAIL
                            </label>
                            <div style="position: relative;">
                                <input type="email" id="reg-email" class="search-pill-input" placeholder="nome@exemplo.com">
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                SENHA
                            </label>
                            <div style="position: relative;">
                                <input type="password" id="reg-password" class="search-pill-input" placeholder="Senha">
                            </div>
                            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; display: block;">Senha deve conter no mínimo 8 caracteres</span>
                        </div>

                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                CONFIRMAR SENHA
                            </label>
                            <div style="position: relative;">
                                <input type="password" id="reg-password-confirm" class="search-pill-input" placeholder="Confirme sua senha">
                            </div>
                            <span style="font-size: 0.72rem; color: var(--text-muted); margin-top: 4px; display: block;">Digite sua senha para confirmar</span>
                        </div>

                        <div id="auth-error-msg" style="color: var(--heart-red); font-size: 0.8rem; text-align: center; display: none;"></div>

                        <button id="register-btn" style="background: linear-gradient(135deg, #5C5468, #3A3543); color: white; border: none; padding: 14px; border-radius: var(--radius-md); font-weight: 700; font-size: 1rem; cursor: pointer; margin-top: 10px;">
                            Criar conta
                        </button>

                        <div style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 16px;">
                            Já tem uma conta? <span id="switch-to-login" style="color: #F2C7E5; font-weight: 700; cursor: pointer;">Entrar</span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="section" style="min-height: 90vh; display: flex; flex-direction: column; justify-content: center; padding: 24px;">
                    <!-- Logo KINDRED -->
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="font-family: 'Playfair Display', Georgia, serif; font-size: 3.2rem; font-weight: 900; letter-spacing: -1px; color: #E5D4ED; text-transform: uppercase;">KINDRED</h1>
                        <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 6px;">Catalogue, descubra e compartilhe suas mídias favoritas.</p>
                    </div>

                    <!-- Formulário de Login -->
                    <div style="display: flex; flex-direction: column; gap: 14px;">
                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                E-MAIL OU USUÁRIO (@HANDLE)
                            </label>
                            <div style="position: relative;">
                                <input type="text" id="login-identifier" class="search-pill-input" placeholder="E-mail ou @usuário">
                            </div>
                        </div>

                        <div>
                            <label style="font-size: 0.75rem; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">
                                SENHA
                            </label>
                            <div style="position: relative;">
                                <input type="password" id="login-password" class="search-pill-input" placeholder="Senha">
                            </div>
                        </div>

                        <div id="auth-error-msg" style="color: var(--heart-red); font-size: 0.8rem; text-align: center; display: none;"></div>

                        <button id="login-btn" style="background: linear-gradient(135deg, #5C5468, #3A3543); color: white; border: none; padding: 14px; border-radius: var(--radius-md); font-weight: 700; font-size: 1rem; cursor: pointer; margin-top: 10px;">
                            Entrar
                        </button>

                        <button id="google-login-btn" style="background: #22222E; color: white; border: 1px solid var(--border-color); padding: 12px; border-radius: var(--radius-md); font-weight: 600; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;">
                            Continuar com Google
                        </button>

                        <div style="text-align: center; font-size: 0.85rem; color: var(--text-secondary); margin-top: 12px;">
                            Ainda não tem uma conta? <span id="switch-to-reg" style="color: #F2C7E5; font-weight: 700; cursor: pointer;">Criar conta</span>
                        </div>
                    </div>
                </div>
            `;
        }

        attachEvents();
    }

    function attachEvents() {
        const errorMsg = container.querySelector('#auth-error-msg');

        if (currentScreen === 'register') {
            const switchLogin = container.querySelector('#switch-to-login');
            const registerBtn = container.querySelector('#register-btn');

            if (switchLogin) {
                switchLogin.addEventListener('click', () => {
                    currentScreen = 'login';
                    renderScreen();
                });
            }

            if (registerBtn) {
                registerBtn.addEventListener('click', async () => {
                    const displayName = container.querySelector('#reg-display-name').value.trim();
                    const username = container.querySelector('#reg-username').value.trim();
                    const email = container.querySelector('#reg-email').value.trim();
                    const password = container.querySelector('#reg-password').value.trim();
                    const passwordConfirm = container.querySelector('#reg-password-confirm').value.trim();

                    if (!username || !email || !password) {
                        errorMsg.style.display = 'block';
                        errorMsg.innerText = "Preencha o nome de usuário, e-mail e senha.";
                        return;
                    }

                    if (password !== passwordConfirm) {
                        errorMsg.style.display = 'block';
                        errorMsg.innerText = "As senhas não coincidem.";
                        return;
                    }

                    try {
                        const res = await fetch('/api/auth/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ display_name: displayName, username, email, password })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Erro no cadastro.");

                        if (data.token) localStorage.setItem('kindred_token', data.token);
                        localStorage.setItem('kindred_session_user', JSON.stringify(data.user));
                        window.location.reload();
                    } catch (err) {
                        errorMsg.style.display = 'block';
                        errorMsg.innerText = err.message;
                    }
                });
            }
        } else {
            const switchReg = container.querySelector('#switch-to-reg');
            const loginBtn = container.querySelector('#login-btn');

            if (switchReg) {
                switchReg.addEventListener('click', () => {
                    currentScreen = 'register';
                    renderScreen();
                });
            }

            if (loginBtn) {
                loginBtn.addEventListener('click', async () => {
                    const identifier = container.querySelector('#login-identifier').value.trim();
                    const password = container.querySelector('#login-password').value.trim();

                    if (!identifier || !password) {
                        errorMsg.style.display = 'block';
                        errorMsg.innerText = "Preencha e-mail/usuário e senha.";
                        return;
                    }

                    try {
                        const res = await fetch('/api/auth/login', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ emailOrUsername: identifier, password })
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data.error || "Login falhou.");

                        if (data.token) localStorage.setItem('kindred_token', data.token);
                        localStorage.setItem('kindred_session_user', JSON.stringify(data.user));
                        window.location.reload();
                    } catch (err) {
                        errorMsg.style.display = 'block';
                        errorMsg.innerText = err.message;
                    }
                });
            }
        }
    }

    renderScreen();
}
