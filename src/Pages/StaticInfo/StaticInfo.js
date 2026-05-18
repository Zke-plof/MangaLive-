import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import MainContainer from '../../Layouts/MainContainer/MainContainer';
import { Helmet } from 'react-helmet-async';
import styles from './static-info.module.scss';

const StaticInfo = () => {
    const { page } = useParams();
    const currentPage = page?.toLowerCase() || 'about';

    // Interactive State for Merch Store
    const [cartCount, setCartCount] = useState(0);
    const [purchasedItem, setPurchasedItem] = useState(null);

    // Interactive State for Users Search
    const [searchQuery, setSearchQuery] = useState('');

    const usersData = [
        { name: 'MiloScat', role: 'Administrator', joined: 'Jan 2024', status: 'Online', comments: 1420 },
        { name: 'ZeldaLegends', role: 'Moderator', joined: 'Feb 2024', status: 'Offline', comments: 840 },
        { name: 'team clachoutoufou', role: 'Group Leader', joined: 'Mar 2024', status: 'Online', comments: 620 },
        { name: 'Arwing Landing', role: 'Scanlator', joined: 'Apr 2024', status: 'Online', comments: 390 },
        { name: 'MangaFanatic', role: 'Member', joined: 'May 2024', status: 'Offline', comments: 230 },
        { name: 'WebtoonExplorer', role: 'Member', joined: 'Jun 2024', status: 'Online', comments: 154 },
        { name: 'ChibiReader', role: 'Member', joined: 'Jul 2024', status: 'Offline', comments: 98 },
        { name: 'ScanNation', role: 'Scanlator', joined: 'Aug 2024', status: 'Offline', comments: 12 }
    ];

    const filteredUsers = useMemo(() => {
        return usersData.filter(u => 
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    const merchItems = [
        { id: 1, name: 'MangaLive Classic Tee', price: '$24.99', desc: 'Premium heavy cotton t-shirt with our minimalist flat logo.', tag: 'Hot' },
        { id: 2, name: 'MangaLive Cozy Hoodie', price: '$49.99', desc: 'Ultra-soft fleece hoodie featuring our signature orange brand colors.', tag: 'Popular' },
        { id: 3, name: 'Minimalist Logo Poster', price: '$14.99', desc: 'Matte print design to decorate your reading space.', tag: 'New' },
        { id: 4, name: 'Scanlator Coffee Mug', price: '$12.99', desc: 'The perfect ceramic mug for those late-night scanlation translations.', tag: 'Eco' }
    ];

    const handleBuy = (itemName) => {
        setCartCount(prev => prev + 1);
        setPurchasedItem(itemName);
        setTimeout(() => setPurchasedItem(null), 3000);
    };

    return (
        <MainContainer mainClasses="suggestion-page" containerClasses="suggest-content" isHeaderBlack>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{currentPage.toUpperCase()} | MangaLive</title>
            </Helmet>

            <div className={styles.wrapper}>
                {currentPage === 'about' && (
                    <div className={styles.card}>
                        <h1 className={styles.title}>About MangaLive</h1>
                        <p className={styles.intro}>
                            MangaLive is an ultra-fast, clean, and completely ad-free reader community built by manga fans, for manga fans. 
                            We connect passionate readers with amazing translators all around the globe.
                        </p>
                        
                        <div className={styles.section}>
                            <h2 className={styles.subtitle}>Our Mission</h2>
                            <p className={styles.text}>
                                We believe reading manga should be smooth, uninterrupted, and premium. That's why we focus on fast loads, 
                                multi-device compatibility, elegant navigation drawers, and robust translation utilities without annoying popups.
                            </p>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.subtitle}>Core Features</h2>
                            <ul className={styles.list}>
                                <li>✨ <strong>Global Translate:</strong> Auto-translates titles instantly using Google Translate API.</li>
                                <li>📜 <strong>Continuous Scroll Mode:</strong> Read manga chapters comfortably like modern webtoons.</li>
                                <li>📂 <strong>Demographic Categories:</strong> Separate filters for Manga, Manhwa, Manhua, and Mature titles.</li>
                                <li>⚡ <strong>Zero Bloat:</strong> Extremely lightweight bundle built on top of high-performance APIs.</li>
                            </ul>
                        </div>
                    </div>
                )}

                {currentPage === 'rules' && (
                    <div className={styles.card}>
                        <h1 className={styles.title}>Site Rules & Guidelines</h1>
                        <p className={styles.intro}>
                            To keep our community friendly, fair, and welcoming, all users and groups must follow these simple rules:
                        </p>

                        <div className={styles.rulesList}>
                            <div className={styles.ruleItem}>
                                <div className={styles.ruleNumber}>1</div>
                                <div className={styles.ruleText}>
                                    <strong>Be Respectful</strong>
                                    <p>Harassment, hate speech, or abuse in comments, chapter discussions, or scanlation notes will not be tolerated.</p>
                                </div>
                            </div>

                            <div className={styles.ruleItem}>
                                <div className={styles.ruleNumber}>2</div>
                                <div className={styles.ruleText}>
                                    <strong>Credit Translators</strong>
                                    <p>Always respect and credit scanlation groups and solo uploaders. Do not claim ownership of translations that are not yours.</p>
                                </div>
                            </div>

                            <div className={styles.ruleItem}>
                                <div className={styles.ruleNumber}>3</div>
                                <div className={styles.ruleText}>
                                    <strong>Keep Spoilers Tagged</strong>
                                    <p>Do not post raw plot details, end-of-volume cliffhangers, or massive story spoilers without hiding them inside spoiler blocks.</p>
                                </div>
                            </div>

                            <div className={styles.ruleItem}>
                                <div className={styles.ruleNumber}>4</div>
                                <div className={styles.ruleText}>
                                    <strong>No Spam or Self-Promotion</strong>
                                    <p>Keep comments relevant to the chapters. Refrain from advertising external platforms, services, or unrelated links.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {currentPage === 'announcements' && (
                    <div className={styles.card}>
                        <h1 className={styles.title}>Announcements & Updates</h1>
                        <p className={styles.intro}>Follow the latest developments and platform logs directly from the MangaLive staff.</p>

                        <div className={styles.feed}>
                            <div className={styles.feedItem}>
                                <div className={styles.feedDate}>May 17, 2026</div>
                                <h3 className={styles.feedTitle}>🚀 Platform Upgraded to v2.2</h3>
                                <p className={styles.feedText}>
                                    We have fully integrated high-speed Google Translate support for Japanese, Korean, and Chinese card listings, 
                                    fixed image cover 404 fallbacks, and completely resolved slider drag issues!
                                </p>
                            </div>

                            <div className={styles.feedItem}>
                                <div className={styles.feedDate}>May 10, 2026</div>
                                <h3 className={styles.feedTitle}>📜 Continuous Scroll Reader Released</h3>
                                <p className={styles.feedText}>
                                    Readers can now toggle between single-page layout and a continuous, stack-based scroll layout perfect for webtoons 
                                    and standard series. Your reading mode preferences are preserved in local storage!
                                </p>
                            </div>

                            <div className={styles.feedItem}>
                                <div className={styles.feedDate}>Apr 29, 2026</div>
                                <h3 className={styles.feedTitle}>⚡ Server Migration Completed</h3>
                                <p className={styles.feedText}>
                                    We migrated our caching backend to decrease latency on chapter lists and volume pages by over 45%!
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {currentPage === 'merch' && (
                    <div className={styles.card}>
                        <div className={styles.merchHeader}>
                            <div>
                                <h1 className={styles.title}>MangaLive Merch Store</h1>
                                <p className={styles.intro}>Support our platform developers and look stylish with our minimalist gear.</p>
                            </div>
                            <div className={styles.cartBadge}>
                                🛒 Cart: <strong>{cartCount}</strong>
                            </div>
                        </div>

                        {purchasedItem && (
                            <div className={styles.alert}>
                                🎉 Added <strong>{purchasedItem}</strong> to your shopping cart!
                            </div>
                        )}

                        <div className={styles.merchGrid}>
                            {merchItems.map(item => (
                                <div className={styles.merchCard} key={item.id}>
                                    <div className={styles.merchBanner}>
                                        <span className={styles.tag}>{item.tag}</span>
                                    </div>
                                    <div className={styles.merchInfo}>
                                        <div className={styles.merchMeta}>
                                            <h3 className={styles.merchTitle}>{item.name}</h3>
                                            <span className={styles.price}>{item.price}</span>
                                        </div>
                                        <p className={styles.merchDesc}>{item.desc}</p>
                                        <button 
                                            onClick={() => handleBuy(item.name)}
                                            className={styles.buyButton}
                                        >
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentPage === 'users' && (
                    <div className={styles.card}>
                        <div className={styles.usersHeader}>
                            <div>
                                <h1 className={styles.title}>Community Directory</h1>
                                <p className={styles.intro}>Browse members and scanlation group leaders in the MangaLive family.</p>
                            </div>
                            <div className={styles.searchBox}>
                                <input 
                                    type="text" 
                                    placeholder="Search users or roles..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={styles.searchInput}
                                />
                            </div>
                        </div>

                        <div className={styles.tableWrapper}>
                            <table className={styles.usersTable}>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Role</th>
                                        <th>Joined</th>
                                        <th>Activity</th>
                                        <th>Comments</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? (
                                        filteredUsers.map((user, idx) => (
                                            <tr key={idx}>
                                                <td className={styles.userName}>💬 {user.name}</td>
                                                <td>
                                                    <span className={`${styles.roleBadge} ${styles[user.role.toLowerCase().replace(' ', '')]}`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td>{user.joined}</td>
                                                <td>
                                                    <span className={`${styles.statusDot} ${styles[user.status.toLowerCase()]}`}></span>
                                                    {user.status}
                                                </td>
                                                <td className={styles.commentsCount}>{user.comments}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className={styles.noResults}>
                                                No users found matching "{searchQuery}"
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </MainContainer>
    );
};

export default StaticInfo;
