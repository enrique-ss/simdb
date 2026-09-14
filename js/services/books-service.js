import { CONFIG, BOOK_ICON_EMOJI } from '../config.js';

export async function searchBooks(query) {
    if (!query) return [];
    try {
        const url = `${CONFIG.OPEN_LIBRARY_BASE}/search.json?q=${encodeURIComponent(query)}&limit=10`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Erro na busca Open Library");
        const data = await res.json();
        return (data.docs || []).map(item => {
            const coverId = item.cover_i;
            const posterUrl = coverId 
                ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` 
                : 'https://via.placeholder.com/300x450?text=Sem+Capa';
            return {
                id: `openlibrary_book_${item.key ? item.key.replace('/works/', '') : Math.random()}`,
                external_id: item.key || String(Math.random()),
                media_type: 'book',
                title: item.title,
                icon_emoji: BOOK_ICON_EMOJI,
                poster: posterUrl,
                release_year: item.first_publish_year ? String(item.first_publish_year) : 'N/A',
                author: item.author_name ? item.author_name.join(', ') : 'Autor Desconhecido',
                rating: item.ratings_average ? Number(item.ratings_average).toFixed(1) : '4.5'
            };
        });
    } catch (err) {
        console.warn("Fallback de busca Open Library mock:", err);
        return [
            {
                id: "openlibrary_book_demo1",
                external_id: "OL27448W",
                media_type: "book",
                title: "O Hobbit",
                icon_emoji: BOOK_ICON_EMOJI,
                poster: "https://covers.openlibrary.org/b/id/8406786-M.jpg",
                release_year: "1937",
                author: "J.R.R. Tolkien",
                rating: "4.9"
            }
        ];
    }
}
