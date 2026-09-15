let appConfig = null;
let supabaseInstance = null;

export async function getAppConfig() {
    if (!appConfig) {
        try {
            const res = await fetch('/api/config');
            appConfig = await res.json();
        } catch (err) {
            appConfig = { appMode: 'local', supabaseUrl: '', supabaseAnonKey: '' };
        }
    }
    return appConfig;
}

export async function getSupabase() {
    const config = await getAppConfig();
    if (config.appMode === 'supabase' && window.supabase) {
        if (!supabaseInstance && config.supabaseUrl) {
            supabaseInstance = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
        }
        return supabaseInstance;
    }
    return null;
}

export function getSessionUser() {
    const sessionData = localStorage.getItem('kindred_session_user');
    return sessionData ? JSON.parse(sessionData) : null;
}

export function getToken() {
    return localStorage.getItem('kindred_token');
}

export async function getCurrentUserProfile() {
    const token = getToken();
    if (!token) return null;

    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('profiles').select('*').eq('id', sessionUser.id).single();
        if (data) return data;
    }

    try {
        const res = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            // Um 404 também invalida a sessão: isso acontece quando o banco foi
            // reinicializado e o token ainda existe no navegador.
            if (res.status === 401 || res.status === 403 || res.status === 404) {
                localStorage.removeItem('kindred_session_user');
                localStorage.removeItem('kindred_token');
                return null;
            }
            throw new Error("Erro API Perfil");
        }
        const user = await res.json();
        
        // Atualizar localStorage com dados frescos do backend
        localStorage.setItem('kindred_session_user', JSON.stringify(user));
        
        return user;
    } catch (err) {
        console.error("Erro ao obter perfil:", err);
        const sessionUser = getSessionUser();
        return sessionUser;
    }
}

export async function updateUserProfile(updates) {
    const token = getToken();
    if (!token) throw new Error('Sessão expirada. Entre novamente para salvar as configurações.');

    const sb = await getSupabase();
    if (sb) {
        const sessionUser = getSessionUser();
        const { error } = await sb.from('profiles').update(updates).eq('id', sessionUser.id);
        if (error) throw error;
        const updatedLocal = { ...sessionUser, ...updates };
        localStorage.setItem('kindred_session_user', JSON.stringify(updatedLocal));
        return updatedLocal;
    }

    try {
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updates)
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Não foi possível salvar o perfil.');
        if (!data.user) throw new Error('O servidor não retornou o perfil atualizado.');
        localStorage.setItem('kindred_session_user', JSON.stringify(data.user));
        return data.user;
    } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
        throw err;
    }
}

export async function getUserProgress() {
    const token = getToken();
    if (!token) return [];

    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('user_media_progress').select('*').eq('user_id', sessionUser.id);
        if (data) return data;
    }

    try {
        const res = await fetch('/api/progress', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function advanceProgress(progressId) {
    try {
        await fetch('/api/progress/advance', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: progressId })
        });
    } catch (err) {
        console.error("Erro ao avançar progresso:", err);
    }
}

export async function getFriendsActivities() {
    const token = getToken();
    if (!token) return [];

    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('reviews_ratings').select('*').limit(10);
        if (data) return data;
    }

    try {
        const res = await fetch('/api/activities', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function searchUsers(query) {
    const token = getToken();
    if (!token || !query.trim()) return [];
    const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query.trim())}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) return [];
    return response.json();
}

export async function sendFriendRequest(friendId) {
    const token = getToken();
    if (!token) throw new Error('Sessão expirada.');
    const response = await fetch('/api/friends/request', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ friend_id: friendId }) });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Não foi possível enviar a solicitação.');
    return data;
}

export async function getMediaByTag(tag) {
    const sessionUser = getSessionUser();
    const userId = sessionUser ? sessionUser.id : '';

    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('media_items').select('*').eq('category_tag', tag);
        if (data) return data;
    }

    try {
        const res = await fetch(`/api/media?tag=${tag}&user_id=${userId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function getMediaReviews(mediaId) {
    try {
        const res = await fetch(`/api/reviews?media_id=${mediaId}`);
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function postReview(reviewData) {
    const token = getToken();
    if (!token) return;

    try {
        await fetch('/api/reviews', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(reviewData)
        });
    } catch (err) {
        console.error("Erro ao publicar review:", err);
    }
}

export async function addMediaToProgress(mediaData) {
    const token = getToken();
    if (!token) return;

    try {
        const res = await fetch('/api/progress/add', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(mediaData)
        });
        return await res.json();
    } catch (err) {
        console.error("Erro ao adicionar mídia ao progresso:", err);
    }
}

export async function getUserLists() {
    const sessionUser = getSessionUser();
    if (!sessionUser) return [];

    try {
        const res = await fetch(`/api/lists?user_id=${sessionUser.id}`);
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function getApoieGoal() {
    try {
        const res = await fetch('/api/apoie');
        if (!res.ok) throw new Error("Erro API Apoie");
        return await res.json();
    } catch (err) {
        return { title: 'Lançar a versão para IOS', target_amount: 550.0, current_amount: 0.0, ads_watched_count: 0 };
    }
}
