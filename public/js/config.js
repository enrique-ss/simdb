/* Configurações centrais do Kindred */

export const CONFIG = {
    SUPABASE_URL: window.ENV_SUPABASE_URL || "https://your-supabase-project.supabase.co",
    SUPABASE_ANON_KEY: window.ENV_SUPABASE_ANON_KEY || "your-supabase-anon-key",

    // API Keys (Gratuitas / Tiers Sem Cobrança)
    TMDB_API_KEY: window.ENV_TMDB_API_KEY || "demo_tmdb_key",
    TMDB_BASE_URL: "https://api.themoviedb.org/3",
    TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p/w500",

    RAWG_API_KEY: window.ENV_RAWG_API_KEY || "demo_rawg_key",
    RAWG_BASE_URL: "https://api.rawg.io/api",

    OPEN_LIBRARY_BASE: "https://openlibrary.org"
};
