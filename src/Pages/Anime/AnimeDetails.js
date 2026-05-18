import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AniListApi from '../../Services/AniListApi';
import Spinner from '../../SharedUI/LoadComponents/Spiner/Spinner';
import MainContainer from '../../Layouts/MainContainer/MainContainer';
import Img from '../../SharedUI/StyledComponents/Img/Img';
import { Helmet } from 'react-helmet-async';
import styles from './anime.module.scss';

const MOCK_ANIME_DETAILS = {
    "5114": {
        id: "5114",
        attributes: {
            canonicalTitle: "Fullmetal Alchemist: Brotherhood",
            averageRating: "91.2",
            episodeCount: 64,
            status: "finished",
            startDate: "2009-04-05",
            endDate: "2010-07-04",
            posterImage: { large: "https://media.kitsu.io/anime/poster_images/3914/large.jpg" },
            synopsis: "Two brothers lose their mother and attempt to bring her back using alchemy...",
            youtubeVideoId: "2uq34TeWEdQ"
        },
        genres: [{ attributes: { name: "Action" } }, { attributes: { name: "Adventure" } }]
    },
    "101922": {
        id: "101922",
        attributes: {
            canonicalTitle: "Demon Slayer: Kimetsu no Yaiba",
            averageRating: "85.6",
            episodeCount: 26,
            status: "finished",
            startDate: "2019-04-06",
            endDate: "2019-09-28",
            posterImage: { large: "https://media.kitsu.io/anime/poster_images/13764/large.jpg" },
            synopsis: "Tanjirou Kamado searches for a cure for his demon sister...",
            youtubeVideoId: "VQGCKyvzIM4"
        },
        genres: [{ attributes: { name: "Action" } }, { attributes: { name: "Fantasy" } }]
    }
};

const AnimeDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [anime, setAnime] = useState(null);
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeEp, setActiveEp] = useState(1);
    const [buffering, setBuffering] = useState(false);
    const [server, setServer] = useState('trailer'); // 'trailer' = Official PV, 'server1' = VidSrc.to, 'server2' = VidSrc.xyz, 'server3' = MultiEmbed
    const [isOfflineMode, setIsOfflineMode] = useState(false);
    const [malId, setMalId] = useState(null);

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const result = await AniListApi.getAnimeInfo(id);
                if (result && result.data) {
                    setAnime(result.data);
                    // Fetch genres
                    const genresData = await AniListApi.getAnimeGenres(id);
                    setGenres(genresData || []);
                    
                    // Parse mapping in single JSON response roundtrip!
                    const mappings = result.included || [];
                    const malMapping = mappings.find(m => {
                        const site = m.attributes?.externalSite?.toLowerCase() || '';
                        return site.includes('myanimelist');
                    });
                    let mappedMalId = result.data.idMal || (malMapping ? malMapping.attributes?.externalId : null);

                    // Fallback: If not found in the single roundtrip, fetch directly from mappings relationship!
                    if (!mappedMalId) {
                        console.log("MAL ID not in included block. Fetching mappings directly...");
                        try {
                            const res = await fetch(`https://kitsu.io/api/edge/anime/${id}/mappings?page[limit]=20`);
                            if (res.ok) {
                                const mappingData = await res.json();
                                const directMal = mappingData.data?.find(m => {
                                    const site = m.attributes?.externalSite?.toLowerCase() || '';
                                    return site.includes('myanimelist');
                                });
                                mappedMalId = directMal ? directMal.attributes?.externalId : null;
                            }
                        } catch (e) {
                            console.error("Direct mappings fetch failed:", e);
                        }
                    }

                    // Deep Fallback: If still no MAL ID resolved, search Jikan API by title to resolve the MAL ID!
                    const attrs = result.data.attributes || {};
                    const queryTitle = attrs.canonicalTitle || attrs.english || '';
                    if (!mappedMalId && queryTitle) {
                        console.log(`MAL ID still empty. Searching Jikan API for "${queryTitle}"...`);
                        try {
                            const jikanRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(queryTitle)}&limit=1`);
                            if (jikanRes.ok) {
                                const jikanData = await jikanRes.json();
                                const resolvedId = jikanData.data?.[0]?.mal_id;
                                if (resolvedId) {
                                    console.log("Resolved MAL ID via Jikan API:", resolvedId);
                                    mappedMalId = resolvedId;
                                }
                            }
                        } catch (e) {
                            console.error("Jikan API resolution failed:", e);
                        }
                    }

                    console.log(`Resolved MyAnimeList ID for anime ${id}:`, mappedMalId);
                    setMalId(mappedMalId);
                } else if (MOCK_ANIME_DETAILS[id]) {
                    setAnime(MOCK_ANIME_DETAILS[id]);
                    setGenres(MOCK_ANIME_DETAILS[id].genres || []);
                    setIsOfflineMode(true);
                }
            } catch (err) {
                console.error("Failed to load anime details from AniList:", err);
                if (MOCK_ANIME_DETAILS[id]) {
                    setAnime(MOCK_ANIME_DETAILS[id]);
                    setGenres(MOCK_ANIME_DETAILS[id].genres || []);
                    setIsOfflineMode(true);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

    const handleEpisodeClick = (epNum) => {
        if (epNum === activeEp) return;
        setBuffering(true);
        setActiveEp(epNum);
        setTimeout(() => {
            setBuffering(false);
        }, 1000);
    };

    const attrs = anime?.attributes || {};
    const title = attrs.canonicalTitle || attrs.english || 'Unknown Title';
    const totalEps = attrs.episodeCount || 12;
    const episodesArray = Array.from({ length: totalEps }, (_, i) => i + 1);

    const getStreamUrl = () => {
        const queryTitle = encodeURIComponent(title);
        if (server === 'server1') {
            // Server 2: Premium Unblocked Anime Player (vidsrc.icu) - Native AniList ID, extremely fast!
            return anime?.id 
                ? `https://vidsrc.icu/embed/anime/${anime.id}/${activeEp}/0`
                : `https://multiembed.to/emulator.php?title=${queryTitle}&episode=${activeEp}`;
        } else if (server === 'server2') {
            // Server 3: Premium CDN Anime Player (vidlink.pro) - Ad-free, brand-orange primary color, fast loading!
            return malId 
                ? `https://vidlink.pro/anime/${malId}/${activeEp}/sub?primaryColor=ff6740&fallback=true`
                : `https://multiembed.to/emulator.php?title=${queryTitle}&episode=${activeEp}`;
        } else if (server === 'server3') {
            // Server 4: Alternative Mirror (vidsrc.in) - Active unblocked domain!
            return malId 
                ? `https://vidsrc.in/embed/anime/${malId}/${activeEp}`
                : `https://vidsrc.in/embed/anime/${queryTitle}/${activeEp}`;
        } else {
            // Server 1 (Trailer): YouTube Official PV - Forcing 1080p Full HD by default!
            return attrs.youtubeVideoId 
                ? `https://www.youtube.com/embed/${attrs.youtubeVideoId}?autoplay=1&modestbranding=1&rel=0&vq=hd1080` 
                : '';
        }
    };

    if (loading) {
        return (
            <MainContainer mainClasses="suggestion-page" containerClasses="suggest-content" isHeaderBlack>
                <div className={styles.spinnerWrapper}>
                    <Spinner customStyle={{ width: '45px', height: '45px', borderColor: '#ff6740' }} />
                </div>
            </MainContainer>
        );
    }

    if (!anime) {
        return (
            <MainContainer mainClasses="suggestion-page" containerClasses="suggest-content" isHeaderBlack>
                <div className={styles.errorCard}>
                    <h2>Anime Not Found</h2>
                    <p>We couldn't retrieve metadata for the requested Anime ID.</p>
                    <button onClick={() => navigate('/anime')} className={styles.backButton}>Return to Catalog</button>
                </div>
            </MainContainer>
        );
    }

    const ratingVal = attrs.averageRating ? (parseFloat(attrs.averageRating) / 10).toFixed(1) : '--';

    return (
        <MainContainer mainClasses="suggestion-page" containerClasses="suggest-content" isHeaderBlack>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{title} | AnimeLive</title>
                <meta name="description" content={attrs.synopsis || `Watch ${title} ad-free on AnimeLive.`} />
            </Helmet>

            <button onClick={() => navigate('/anime')} className={styles.backButton}>
                ← Back to Catalog
            </button>

            {isOfflineMode && (
                <div className={styles.offlineNotice}>
                    ⚠️ Connection Offline: Displaying preloaded cached metadata. Video streams require internet.
                </div>
            )}

            {/* Details Section */}
            <div className={styles.detailsRow}>
                <div className={styles.detailsLeft}>
                    <div className={styles.detailsPoster}>
                        <Img 
                            src={attrs.posterImage?.large || attrs.posterImage?.original || 'https://placehold.co/400x600?text=No+Cover'} 
                            alt={title} 
                        />
                    </div>
                    <div className={styles.metaBox}>
                        <div className={styles.metaItem}>
                            <span>Score:</span>
                            <strong>★ {ratingVal}</strong>
                        </div>
                        <div className={styles.metaItem}>
                            <span>Episodes:</span>
                            <strong>{attrs.episodeCount || 'Ongoing'}</strong>
                        </div>
                        <div className={styles.metaItem}>
                            <span>Status:</span>
                            <strong style={{ textTransform: 'capitalize' }}>{attrs.status || 'Unknown'}</strong>
                        </div>
                        <div className={styles.metaItem}>
                            <span>Aired:</span>
                            <strong>{attrs.startDate || 'Unknown'}</strong>
                        </div>
                    </div>
                </div>

                <div className={styles.detailsRight}>
                    <h1 className={styles.detailTitle}>{title}</h1>

                    <div className={styles.genresRow}>
                        {genres.map((g, idx) => (
                            <span className={styles.genreBadge} key={g.id || idx}>{g.attributes?.name}</span>
                        ))}
                    </div>

                    <div className={styles.synopsisBox}>
                        <h3>Synopsis</h3>
                        <p>{attrs.synopsis || 'No description available for this title.'}</p>
                    </div>
                </div>
            </div>

            {/* 📺 Video Streaming Player */}
            <div className={styles.playerContainer}>
                <div className={styles.playerHeader}>
                    <h2 className={styles.playerTitle}>📺 Now Streaming: Episode {activeEp}</h2>
                    <div className={styles.serverControls}>
                        {attrs.youtubeVideoId && (
                            <button 
                                className={`${styles.serverBtn} ${server === 'trailer' ? styles.activeServer : ''}`}
                                onClick={() => { setBuffering(true); setServer('trailer'); setTimeout(() => setBuffering(false), 600); }}
                            >
                                Server 1 (Official PV)
                            </button>
                        )}
                        <button 
                            className={`${styles.serverBtn} ${server === 'server1' ? styles.activeServer : ''}`}
                            onClick={() => { setBuffering(true); setServer('server1'); setTimeout(() => setBuffering(false), 600); }}
                        >
                            Server 2 (Unblocked Direct)
                        </button>
                        <button 
                            className={`${styles.serverBtn} ${server === 'server2' ? styles.activeServer : ''}`}
                            onClick={() => { setBuffering(true); setServer('server2'); setTimeout(() => setBuffering(false), 600); }}
                        >
                            Server 3 (Premium CDN)
                        </button>
                        <button 
                            className={`${styles.serverBtn} ${server === 'server3' ? styles.activeServer : ''}`}
                            onClick={() => { setBuffering(true); setServer('server3'); setTimeout(() => setBuffering(false), 600); }}
                        >
                            Server 4 (Backup Mirror)
                        </button>
                    </div>
                </div>

                <div className={styles.videoScreen}>
                    {buffering ? (
                        <div className={styles.playerOverlay}>
                            <Spinner customStyle={{ width: '50px', height: '50px', borderColor: '#ff6740' }} />
                            <p className={styles.overlayText}>Connecting to secure streaming server...</p>
                        </div>
                    ) : getStreamUrl() ? (
                        <iframe 
                            src={getStreamUrl()}
                            title={`${title} Episode ${activeEp}`}
                            className={styles.iframePlayer}
                            allowFullScreen={true}
                            allow="autoplay; encrypted-media; fullscreen; picture-in-picture; clipboard-write; gyroscope; accelerometer; geolocation"
                            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
                        />
                    ) : (
                        <div className={styles.playerOverlay}>
                            <p className={styles.overlayText}>No direct streaming servers available for this episode.</p>
                        </div>
                    )}
                </div>

                <div className={styles.playerControls} style={{ marginTop: '16px', background: 'rgba(255, 103, 64, 0.05)', border: '1px solid rgba(255, 103, 64, 0.1)', padding: '20px', borderRadius: '12px' }}>
                    <p className={styles.mirrorText} style={{ fontSize: '0.95rem', lineHeight: '1.6', color: '#4b5563', margin: '0 0 16px 0' }}>
                        💡 <strong>Streaming & Quality Tips:</strong>
                        <br />
                        • <strong>Force High Definition (1080p):</strong> For the Official PV (Server 1), we have forced <strong>1080p Full HD</strong> query parameters. If it starts out at 360p, simply tap the gear icon inside the YouTube player bar and select <strong>1080p</strong> manually to enjoy crisp HD!
                        <br />
                        • <strong>Server Not Loading?</strong> Some internet providers block third-party streaming mirrors. If Server 2, 3, or 4 show a blank screen or a loading spinner, we highly recommend switching your device DNS to a secure free provider (like <strong>Cloudflare 1.1.1.1</strong> or <strong>Google DNS 8.8.8.8</strong>) or using a free VPN. This instantly unlocks all premium mirrors!
                    </p>

                    {/* Developer System Diagnostic Panel */}
                    <div style={{ background: '#1e293b', padding: '12px 16px', borderRadius: '8px', border: '1px solid #334155', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                        <div style={{ color: '#ff6740', fontWeight: 'bold', borderBottom: '1px solid #334155', paddingBottom: '6px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                            <span>⚙️ SYSTEM DIAGNOSTIC PANEL</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>v2.4 (AniList Core)</span>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', color: '#e2e8f0' }}>
                            <div>Kitsu Legacy ID: <span style={{ color: '#38bdf8' }}>{id || 'null'}</span></div>
                            <div>AniList ID: <span style={{ color: '#38bdf8' }}>{anime?.id || 'null'}</span></div>
                            <div>MyAnimeList ID: <span style={{ color: malId ? '#4ade80' : '#fb923c' }}>{malId || 'resolving/null'}</span></div>
                            <div>Active Ep: <span style={{ color: '#f472b6' }}>{activeEp}</span></div>
                            <div>Selected Server: <span style={{ color: '#f472b6' }}>{server}</span></div>
                        </div>
                        <div style={{ marginTop: '8px', color: '#94a3b8', fontSize: '0.75rem', wordBreak: 'break-all', borderTop: '1px solid #334155', paddingTop: '6px' }}>
                            Player Stream URL: <span style={{ color: '#38bdf8' }}>{getStreamUrl() || 'none'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Episode Selector directory */}
            <div className={styles.episodesSection}>
                <h3 className={styles.episodesTitle}>Episodes Directory</h3>
                <div className={styles.episodesGrid}>
                    {episodesArray.map(ep => (
                        <button
                            key={ep}
                            onClick={() => handleEpisodeClick(ep)}
                            className={`${styles.epButton} ${activeEp === ep ? styles.epActive : ''}`}
                        >
                            Ep {ep}
                        </button>
                    ))}
                </div>
            </div>
        </MainContainer>
    );
};

export default AnimeDetails;
