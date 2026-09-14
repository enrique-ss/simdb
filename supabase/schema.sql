-- Kindred Database Schema (Supabase / PostgreSQL)

-- 1. PROFILES (Extende auth.users do Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT,
    avatar_url TEXT,
    profile_cover_url TEXT,
    home_banner_url TEXT,
    bio TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MEDIA ITEMS (Cache de mídias do TMDB, RAWG e Open Library)
CREATE TABLE IF NOT EXISTS public.media_items (
    id TEXT PRIMARY KEY, -- e.g. tmdb_movie_123, rawg_game_456, openlibrary_book_789
    media_type TEXT NOT NULL CHECK (media_type IN ('movie', 'series', 'game', 'book')),
    external_id TEXT NOT NULL,
    title TEXT NOT NULL,
    original_title TEXT,
    cover_image_url TEXT,
    backdrop_image_url TEXT,
    release_year INT,
    overview TEXT,
    genres TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. USER MEDIA PROGRESS (Progresso para a seção "Continuar")
CREATE TABLE IF NOT EXISTS public.user_media_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    current_season INT DEFAULT 1,
    current_episode INT DEFAULT 0,
    current_chapter INT DEFAULT 0,
    total_episodes INT,
    total_chapters INT,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'dropped', 'plan_to_watch')),
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, media_id)
);

-- 4. RATINGS & REVIEWS (Avaliações e Curtidas em 3 Níveis)
CREATE TABLE IF NOT EXISTS public.reviews_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    season_number INT DEFAULT NULL,
    episode_number INT DEFAULT NULL,
    feeling TEXT CHECK (feeling IN ('liked', 'disliked', 'indifferent')),
    score NUMERIC(3, 1) CHECK (score >= 0 AND score <= 5),
    is_favorite BOOLEAN DEFAULT FALSE,
    review_text TEXT,
    is_spoiler BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'pt-BR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER RELATIONSHIPS & AFFINITY (Conexão social e cálculo de afinidade)
CREATE TABLE IF NOT EXISTS public.user_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    friend_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'accepted' CHECK (status IN ('pending', 'accepted', 'blocked')),
    affinity_percentage NUMERIC(5, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, friend_id)
);

-- 6. CUSTOM LISTS
CREATE TABLE IF NOT EXISTS public.custom_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT FALSE,
    hide_ratings BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.custom_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    list_id UUID NOT NULL REFERENCES public.custom_lists(id) ON DELETE CASCADE,
    media_id TEXT NOT NULL REFERENCES public.media_items(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(list_id, media_id)
);

-- RLS (Row Level Security) Políticas Básicas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_media_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_list_items ENABLE ROW LEVEL SECURITY;

-- Leitura pública para perfiles e mídias
CREATE POLICY "Profiles são visíveis publicamente" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Usuários podem atualizar próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Mídias são visíveis publicamente" ON public.media_items FOR SELECT USING (true);
CREATE POLICY "Qualquer usuário autenticado pode inserir mídias" ON public.media_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Progresso visível pelo próprio usuário ou amigos" ON public.user_media_progress FOR SELECT USING (true);
CREATE POLICY "Progresso editável pelo dono" ON public.user_media_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Reviews são públicos" ON public.reviews_ratings FOR SELECT USING (true);
CREATE POLICY "Reviews editáveis pelo dono" ON public.reviews_ratings FOR ALL USING (auth.uid() = user_id);
