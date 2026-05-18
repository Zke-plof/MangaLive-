class KitsuAPI {
    BaseLink = 'https://kitsu.io/api/edge';

    getTrendingAnime = async (limit = 12) => {
        try {
            const response = await fetch(`${this.BaseLink}/trending/anime?limit=${limit}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (e) {
            console.error('Failed to fetch trending anime:', e);
            return { data: [] };
        }
    };

    getPopularAnime = async (limit = 12) => {
        try {
            const response = await fetch(`${this.BaseLink}/anime?sort=-userCount&page[limit]=${limit}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (e) {
            console.error('Failed to fetch popular anime:', e);
            return { data: [] };
        }
    };

    searchAnime = async (query, limit = 12) => {
        try {
            const response = await fetch(`${this.BaseLink}/anime?filter[text]=${encodeURIComponent(query)}&page[limit]=${limit}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (e) {
            console.error('Failed to search anime:', e);
            return { data: [] };
        }
    };

    getAnimeInfo = async (id) => {
        try {
            const response = await fetch(`${this.BaseLink}/anime/${id}?include=mappings`);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            return result; // Return full response including the included array
        } catch (e) {
            console.error(`Failed to fetch anime ${id} info:`, e);
            return null;
        }
    };

    getAnimeGenres = async (id) => {
        try {
            const response = await fetch(`${this.BaseLink}/anime/${id}/genres`);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            return result.data || [];
        } catch (e) {
            console.error(`Failed to fetch genres for anime ${id}:`, e);
            return [];
        }
    };

    getMalId = async (id) => {
        try {
            const response = await fetch(`${this.BaseLink}/anime/${id}/mappings?page[limit]=20`);
            if (!response.ok) throw new Error('Network response was not ok');
            const result = await response.json();
            const malMapping = result.data?.find(m => m.attributes?.externalSite === 'myanimelist/anime');
            return malMapping ? malMapping.attributes?.externalId : null;
        } catch (e) {
            console.error(`Failed to fetch MAL ID mapping for anime ${id}:`, e);
            return null;
        }
    };
}

export default new KitsuAPI();
