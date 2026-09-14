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

export async function getCurrentUserProfile() {
    const sessionUser = getSessionUser();
    if (!sessionUser) return null;

    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('profiles').select('*').eq('id', sessionUser.id).single();
        if (data) return data;
    }

    try {
        const res = await fetch(`/api/profile?user_id=${sessionUser.id}`);
        if (!res.ok) throw new Error("Erro API Perfil");
        const user = await res.json();
        return user || sessionUser;
    } catch (err) {
        return sessionUser;
    }
}

export async function updateUserProfile(updates) {
    const sessionUser = getSessionUser();
    if (!sessionUser) return;

    const payload = { id: sessionUser.id, ...updates };

    const sb = await getSupabase();
    if (sb) {
        await sb.from('profiles').update(updates).eq('id', sessionUser.id);
        const updatedLocal = { ...sessionUser, ...updates };
        localStorage.setItem('kindred_session_user', JSON.stringify(updatedLocal));
        return;
    }

    try {
        const res = await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (data.user) {
            localStorage.setItem('kindred_session_user', JSON.stringify(data.user));
        }
    } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
    }
}

export async function getUserProgress() {
    const sessionUser = getSessionUser();
    if (!sessionUser) return [];

    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('user_media_progress').select('*').eq('user_id', sessionUser.id);
        if (data) return data;
    }

    try {
        const res = await fetch(`/api/progress?user_id=${sessionUser.id}`);
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
    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('reviews_ratings').select('*').limit(10);
        if (data) return data;
    }

    try {
        const res = await fetch('/api/activities');
        if (!res.ok) return [];
        return await res.json();
    } catch (err) {
        return [];
    }
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
    const sessionUser = getSessionUser();
    if (!sessionUser) return;

    const payload = {
        user_id: sessionUser.id,
        friend_name: sessionUser.display_name || sessionUser.username,
        friend_avatar: sessionUser.avatar_url,
        ...reviewData
    };

    try {
        await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } catch (err) {
        console.error("Erro ao publicar review:", err);
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
