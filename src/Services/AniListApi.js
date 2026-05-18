class AniListAPI {
    BaseLink = 'https://graphql.anilist.co';

    fetchGraphQL = async (query, variables = {}) => {
        const response = await fetch(this.BaseLink, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                query,
                variables
            })
        });
        if (!response.ok) {
            throw new Error(`AniList API error: ${response.statusText}`);
        }
        return await response.json();
    };

    mapAniListMediaToKitsu = (media) => {
        if (!media) return null;
        return {
            id: String(media.id),
            attributes: {
                canonicalTitle: media.title.english || media.title.romaji || media.title.native,
                english: media.title.english,
                averageRating: media.averageScore ? String(media.averageScore) : null,
                episodeCount: media.episodes,
                status: media.status ? media.status.toLowerCase() : 'unknown',
                startDate: media.startDate?.year ? `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, '0')}-${String(media.startDate.day || 1).padStart(2, '0')}` : null,
                endDate: media.endDate?.year ? `${media.endDate.year}-${String(media.endDate.month || 1).padStart(2, '0')}-${String(media.endDate.day || 1).padStart(2, '0')}` : null,
                posterImage: {
                    large: media.coverImage.extraLarge || media.coverImage.large || media.coverImage.medium,
                    original: media.bannerImage || media.coverImage.extraLarge,
                },
                synopsis: media.description ? media.description.replace(/<[^>]*>/g, '') : 'No synopsis available.',
                youtubeVideoId: media.trailer && media.trailer.site === 'youtube' ? media.trailer.id : null,
                showType: media.type ? media.type.toLowerCase() : 'tv'
            },
            genres: media.genres ? media.genres.map((g, idx) => ({ id: String(idx), attributes: { name: g } })) : [],
            idMal: media.idMal
        };
    };

    getTrendingAnime = async (limit = 12) => {
        const query = `
            query ($perPage: Int) {
              Page (page: 1, perPage: $perPage) {
                media (type: ANIME, sort: TRENDING_DESC) {
                  id
                  idMal
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    extraLarge
                    large
                    medium
                  }
                  bannerImage
                  startDate {
                    year
                    month
                    day
                  }
                  endDate {
                    year
                    month
                    day
                  }
                  averageScore
                  episodes
                  status
                  type
                  genres
                  description
                  trailer {
                    id
                    site
                  }
                }
              }
            }
        `;
        try {
            const result = await this.fetchGraphQL(query, { perPage: limit });
            const list = result.data?.Page?.media || [];
            return {
                data: list.map(this.mapAniListMediaToKitsu)
            };
        } catch (e) {
            console.error('Failed to fetch trending anime from AniList:', e);
            return { data: [] };
        }
    };

    getPopularAnime = async (limit = 12) => {
        const query = `
            query ($perPage: Int) {
              Page (page: 1, perPage: $perPage) {
                media (type: ANIME, sort: POPULARITY_DESC) {
                  id
                  idMal
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    extraLarge
                    large
                    medium
                  }
                  bannerImage
                  startDate {
                    year
                    month
                    day
                  }
                  endDate {
                    year
                    month
                    day
                  }
                  averageScore
                  episodes
                  status
                  type
                  genres
                  description
                  trailer {
                    id
                    site
                  }
                }
              }
            }
        `;
        try {
            const result = await this.fetchGraphQL(query, { perPage: limit });
            const list = result.data?.Page?.media || [];
            return {
                data: list.map(this.mapAniListMediaToKitsu)
            };
        } catch (e) {
            console.error('Failed to fetch popular anime from AniList:', e);
            return { data: [] };
        }
    };

    searchAnime = async (searchQuery, limit = 12) => {
        const query = `
            query ($search: String, $perPage: Int) {
              Page (page: 1, perPage: $perPage) {
                media (type: ANIME, search: $search) {
                  id
                  idMal
                  title {
                    romaji
                    english
                    native
                  }
                  coverImage {
                    extraLarge
                    large
                    medium
                  }
                  bannerImage
                  startDate {
                    year
                    month
                    day
                  }
                  endDate {
                    year
                    month
                    day
                  }
                  averageScore
                  episodes
                  status
                  type
                  genres
                  description
                  trailer {
                    id
                    site
                  }
                }
              }
            }
        `;
        try {
            const result = await this.fetchGraphQL(query, { search: searchQuery, perPage: limit });
            const list = result.data?.Page?.media || [];
            return {
                data: list.map(this.mapAniListMediaToKitsu)
            };
        } catch (e) {
            console.error('Failed to search anime from AniList:', e);
            return { data: [] };
        }
    };

    getAnimeInfo = async (id) => {
        const query = `
            query ($id: Int) {
              Media (id: $id) {
                id
                idMal
                title {
                  romaji
                  english
                  native
                }
                coverImage {
                  extraLarge
                  large
                  medium
                }
                bannerImage
                startDate {
                  year
                  month
                  day
                }
                endDate {
                  year
                  month
                  day
                }
                averageScore
                episodes
                status
                type
                genres
                description
                trailer {
                  id
                  site
                }
              }
            }
        `;
        try {
            const result = await this.fetchGraphQL(query, { id: parseInt(id) });
            const media = result.data?.Media;
            if (!media) return null;
            
            const mapped = this.mapAniListMediaToKitsu(media);
            return {
                data: mapped,
                included: [
                    {
                        attributes: {
                            externalSite: 'myanimelist/anime',
                            externalId: String(media.idMal || '')
                        }
                    }
                ]
            };
        } catch (e) {
            console.warn(`Failed to fetch anime ${id} directly from AniList. Trying legacy Kitsu ID resolution...`);
            try {
                const kitsuRes = await fetch(`https://kitsu.io/api/edge/anime/${id}`);
                if (kitsuRes.ok) {
                    const kitsuData = await kitsuRes.json();
                    const kitsuTitle = kitsuData.data?.attributes?.canonicalTitle || kitsuData.data?.attributes?.english;
                    if (kitsuTitle) {
                        console.log(`Resolved legacy title "${kitsuTitle}" from Kitsu for ID ${id}. Querying AniList...`);
                        const searchResult = await this.searchAnime(kitsuTitle, 1);
                        if (searchResult?.data?.length > 0) {
                            const resolvedAnime = searchResult.data[0];
                            console.log(`Successfully mapped Kitsu ID ${id} to AniList ID ${resolvedAnime.id}`);
                            return {
                                data: resolvedAnime,
                                included: [
                                    {
                                        attributes: {
                                            externalSite: 'myanimelist/anime',
                                            externalId: String(resolvedAnime.idMal || '')
                                        }
                                    }
                                ]
                            };
                        }
                    }
                }
            } catch (kitsuErr) {
                console.error("Legacy Kitsu ID resolution failed:", kitsuErr);
            }
            return null;
        }
    };

    getAnimeGenres = async (id) => {
        const info = await this.getAnimeInfo(id);
        return info?.data?.genres || [];
    };
}

export default new AniListAPI();
