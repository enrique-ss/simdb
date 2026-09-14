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

export async function getCurrentUserProfile() {
    const sb = await getSupabase();
    if (sb) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
            const { data } = await sb.from('profiles').select('*').eq('id', user.id).single();
            if (data) return data;
        }
    }

    // Modo Local (SQLite)
    try {
        const res = await fetch('/api/profile');
        if (!res.ok) throw new Error("Erro na API de perfil");
        return await res.json();
    } catch (err) {
        return {
            id: 'u1',
            username: 'inhunicent',
            display_name: 'nicoly',
            avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
            profile_cover_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
            home_banner_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800',
            bio: 'it was as if he understood the flame that burned inside her as nobody else ever could.'
        };
    }
}

export async function updateUserProfile(updates) {
    const sb = await getSupabase();
    if (sb) {
        const { data: { user } } = await sb.auth.getUser();
        if (user) {
            await sb.from('profiles').update(updates).eq('id', user.id);
            return;
        }
    }

    // Modo Local (SQLite)
    try {
        await fetch('/api/profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
    } catch (err) {
        console.error("Erro ao atualizar perfil:", err);
    }
}

export async function getUserProgress() {
    const sb = await getSupabase();
    if (sb) {
        const { data } = await sb.from('user_media_progress').select('*');
        if (data) return data;
    }

    // Modo Local (SQLite)
    try {
        const res = await fetch('/api/progress');
        if (!res.ok) throw new Error("Erro na API de progresso");
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function advanceProgress(progressId) {
    const sb = await getSupabase();
    if (sb) {
        // Atualiza no Supabase se estivesse ativo
        return;
    }

    // Modo Local (SQLite)
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
        const { data } = await sb.from('reviews_ratings').select('*, profiles(*)').limit(10);
        if (data) return data;
    }

    // Modo Local (SQLite)
    try {
        const res = await fetch('/api/activities');
        if (!res.ok) throw new Error("Erro na API de atividades");
        return await res.json();
    } catch (err) {
        return [];
    }
}

export async function getApoieGoal() {
    const config = await getAppConfig();
    if (config.appMode === 'local') {
        try {
            const res = await fetch('/api/apoie');
            if (!res.ok) throw new Error("Erro API Apoie");
            return await res.json();
        } catch (err) {
            return { title: 'Lançar a versão para IOS', target_amount: 550.0, current_amount: 0.0, ads_watched_count: 0 };
        }
    }
    return { title: 'Lançar a versão para IOS', target_amount: 550.0, current_amount: 0.0, ads_watched_count: 0 };
}
