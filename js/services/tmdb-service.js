import { CONFIG } from '../config.js';

export async function searchTMDB(query, type = 'movie') {
    if (!query) return [];
    try {
        const url = `${CONFIG.TMDB_BASE_URL}/search/${type}?api_key=${CONFIG.TMDB_API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro na busca TMDB");
        const data = await res.json();
        return (data.results || []).map(item => ({
            id: `tmdb_${type}_${item.id}`,
            external_id: String(item.id),
            media_type: type === 'tv' ? 'series' : 'movie',
            title: item.title || item.name,
            poster: item.poster_path ? `${CONFIG.TMDB_IMAGE_BASE}${item.poster_path}` : 'https://via.placeholder.com/300x450?text=Sem+Capa',
            release_year: (item.release_date || item.first_air_date || '').substring(0, 4),
            overview: item.overview,
            rating: item.vote_average ? (item.vote_average / 2).toFixed(1) : 'N/A'
        }));
    } catch (err) {
        console.warn("Fallback de busca TMDB mock devido a erro:", err);
        return [
            {
                id: `tmdb_${type}_demo1`,
                external_id: "101",
                media_type: type === 'tv' ? 'series' : 'movie',
                title: type === 'tv' ? "Breaking Bad" : "Inception",
                poster: type === 'tv' ? "https://image.tmdb.org/t/p/w500/zt5uu278ed6Z4oDUpYq0KjZq09s.jpg" : "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                release_year: type === 'tv' ? "2008" : "2010",
                overview: "Demonstração de busca de mídia.",
                rating: "4.8"
            }
        ];
    }
}
