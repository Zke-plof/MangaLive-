import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AniListApi from '../../Services/AniListApi';
import Spinner from '../../SharedUI/LoadComponents/Spiner/Spinner';
import MainContainer from '../../Layouts/MainContainer/MainContainer';
import Img from '../../SharedUI/StyledComponents/Img/Img';
import { Helmet } from 'react-helmet-async';
import styles from './anime.module.scss';

const MOCK_ANIME_FALLBACK = [
    {
        id: "5114",
        attributes: {
            canonicalTitle: "Fullmetal Alchemist: Brotherhood",
            averageRating: "91.2",
            episodeCount: 64,
            showType: "tv",
            posterImage: { large: "https://media.kitsu.io/anime/poster_images/3914/large.jpg" },
            synopsis: "Two brothers lose their mother and attempt to bring her back using alchemy..."
        }
    },
    {
        id: "101922",
        attributes: {
            canonicalTitle: "Demon Slayer: Kimetsu no Yaiba",
            averageRating: "85.6",
            episodeCount: 26,
            showType: "tv",
            posterImage: { large: "https://media.kitsu.io/anime/poster_images/13764/large.jpg" },
            synopsis: "Tanjirou Kamado searches for a cure for his demon sister..."
        }
    },
    {
        id: "113415",
        attributes: {
            canonicalTitle: "Jujutsu Kaisen",
            averageRating: "86.4",
            episodeCount: 24,
            showType: "tv",
            posterImage: { large: "https://media.kitsu.io/anime/poster_images/43806/large.jpg" },
            synopsis: "Yuji Itadori swallows a cursed finger to save his friends..."
        }
    },
    {
        id: "21459",
        attributes: {
            canonicalTitle: "My Hero Academia",
            averageRating: "79.8",
            episodeCount: 13,
            showType: "tv",
            posterImage: { large: "https://media.kitsu.io/anime/poster_images/11417/large.jpg" },
            synopsis: "In a world of superpowers, a quirkless boy inherits the ultimate power..."
        }
    }
];

const AnimePortal = () => {
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [popular, setPopular] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [searching, setSearching] = useState(false);
    const [isOfflineMode, setIsOfflineMode] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchInitialData = async () => {
            setLoading(true);

            // Attempt to load from session storage cache
            const cachedTrending = sessionStorage.getItem('anilist_trending');
            const cachedPopular = sessionStorage.getItem('anilist_popular');

            if (cachedTrending && cachedPopular) {
                if (isMounted) {
                    setTrending(JSON.parse(cachedTrending));
                    setPopular(JSON.parse(cachedPopular));
                    setLoading(false);
                }
                return;
            }

            try {
                // Fetch trending and popular from AniList API
                const trendingRes = await AniListApi.getTrendingAnime();
                const popularRes = await AniListApi.getPopularAnime();

                let hasData = false;
                if (isMounted && trendingRes?.data && trendingRes.data.length > 0) {
                    setTrending(trendingRes.data);
                    sessionStorage.setItem('anilist_trending', JSON.stringify(trendingRes.data));
                    hasData = true;
                }

                if (isMounted && popularRes?.data && popularRes.data.length > 0) {
                    setPopular(popularRes.data);
                    sessionStorage.setItem('anilist_popular', JSON.stringify(popularRes.data));
                    hasData = true;
                }

                // If Kitsu API failed due to network / offline
                if (isMounted && !hasData) {
                    setIsOfflineMode(true);
                    setTrending(MOCK_ANIME_FALLBACK.slice(0, 2));
                    setPopular(MOCK_ANIME_FALLBACK);
                }
            } catch (err) {
                console.error("Failed to load kitsu lists:", err);
                if (isMounted) {
                    setIsOfflineMode(true);
                    setTrending(MOCK_ANIME_FALLBACK.slice(0, 2));
                    setPopular(MOCK_ANIME_FALLBACK);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchInitialData();
        return () => { isMounted = false; };
    }, []);

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.trim().length >= 3) {
            setSearching(true);
            const res = await AniListApi.searchAnime(query);
            setSearchResults(res?.data || []);
            setSearching(false);
        } else {
            setSearchResults([]);
        }
    };

    return (
        <MainContainer mainClasses="suggestion-page" containerClasses="suggest-content" isHeaderBlack>
            <Helmet>
                <meta charSet="utf-8" />
                <title>AnimeLive | Watch Anime Ad-Free</title>
                <meta name="description" content="Dedicated high-speed portal to browse and watch your favorite anime ad-free using AniList API v2." />
            </Helmet>

            <div className={styles.header}>
                <div className={styles.headerTitleRow}>
                    <h1 className={styles.title}>AnimeLive</h1>
                    <span className={styles.betaBadge}>AniList API v2</span>
                </div>
                <p className={styles.description}>
                    A clean, ad-free streaming catalog powered by the stable AniList API v2. Browse trending seasonal airing, popular classics, or search anything instantly.
                </p>
            </div>

            {isOfflineMode && (
                <div className={styles.offlineNotice}>
                    ⚠️ Connection Offline: Displaying preloaded cached popular titles.
                </div>
            )}

            {/* Search Input Section */}
            <div className={styles.searchSection}>
                <input 
                    type="text" 
                    placeholder="Search over 25,000+ anime titles..." 
                    value={searchQuery}
                    onChange={handleSearch}
                    className={styles.searchInput}
                />
            </div>

            {loading ? (
                <div className={styles.spinnerWrapper}>
                    <Spinner customStyle={{ width: '45px', height: '45px', borderColor: '#ff6740' }} />
                </div>
            ) : searchQuery.trim().length >= 3 ? (
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        Search Results for "{searchQuery}"
                        {searching && <span className={styles.searchingText}> searching...</span>}
                    </h2>
                    {searchResults.length > 0 ? (
                        <div className={styles.grid}>
                            {searchResults.map((anime, idx) => (
                                <AnimeCard key={anime.id + '-' + idx} anime={anime} onClick={() => navigate(`/anime/${anime.id}`)} />
                            ))}
                        </div>
                    ) : (
                        !searching && <p className={styles.noResults}>No anime found matching your query.</p>
                    )}
                </div>
            ) : (
                <>
                    {/* Trending Section */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>Trending Now</h2>
                        <div className={styles.grid}>
                            {trending.slice(0, 12).map((anime, idx) => (
                                <AnimeCard key={anime.id + '-' + idx} anime={anime} onClick={() => navigate(`/anime/${anime.id}`)} />
                            ))}
                        </div>
                    </div>

                    {/* Popular Section */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>All-Time Most Popular</h2>
                        <div className={styles.grid}>
                            {popular.slice(0, 12).map((anime, idx) => (
                                <AnimeCard key={anime.id + '-' + idx} anime={anime} onClick={() => navigate(`/anime/${anime.id}`)} />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </MainContainer>
    );
};

const AnimeCard = ({ anime, onClick }) => {
    const attrs = anime.attributes || {};
    const title = attrs.canonicalTitle || attrs.english || 'Unknown Title';
    const scoreVal = attrs.averageRating ? (parseFloat(attrs.averageRating) / 10).toFixed(1) : '--';
    const score = `★ ${scoreVal}`;
    const eps = attrs.episodeCount ? `${attrs.episodeCount} eps` : 'Ongoing';
    const type = attrs.showType ? attrs.showType.toUpperCase() : 'TV';
    const coverUrl = attrs.posterImage?.large || attrs.posterImage?.original || 'https://placehold.co/400x600?text=No+Cover';

    return (
        <div className={styles.card} onClick={onClick}>
            <div className={styles.imageWrapper}>
                <Img src={coverUrl} alt={title} />
                <span className={styles.scoreBadge}>{score}</span>
            </div>
            <div className={styles.meta}>
                <h3 className={styles.cardTitle}>{title.length > 32 ? title.slice(0, 32) + '...' : title}</h3>
                <div className={styles.cardSubMeta}>
                    <span>{type}</span>
                    <span>•</span>
                    <span>{eps}</span>
                </div>
            </div>
        </div>
    );
};

export default AnimePortal;
