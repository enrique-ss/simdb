import { CONFIG } from '../config.js';

export async function searchGames(query) {
    if (!query) return [];
    try {
        const url = `${CONFIG.RAWG_BASE_URL}/games?key=${CONFIG.RAWG_API_KEY}&search=${encodeURIComponent(query)}&page_size=10`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro na busca RAWG");
        const data = await res.json();
        return (data.results || []).map(item => ({
            id: `rawg_game_${item.id}`,
            external_id: String(item.id),
            media_type: 'game',
            title: item.name,
            poster: item.background_image || 'https://via.placeholder.com/300x450?text=Sem+Capa',
            release_year: (item.released || '').substring(0, 4),
            overview: `Classificação: ${item.rating || 'N/A'} / 5`,
            rating: item.rating ? Number(item.rating).toFixed(1) : 'N/A'
        }));
    } catch (err) {
        console.warn("Fallback de busca RAWG mock:", err);
        return [
            {
                id: "rawg_game_demo1",
                external_id: "3498",
                media_type: "game",
                title: "The Witcher 3: Wild Hunt",
                poster: "",
                release_year: "2015",
                overview: "RPG eletrônico de ação de mundo aberto.",
                rating: "4.9"
            }
        ];
    }
}
