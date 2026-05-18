import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import MangaDexApi from '../../Services/MangaDexApi';
import Cards from '../../Features/Cards/Cards';
import Spinner from '../../SharedUI/LoadComponents/Spiner/Spinner';
import MainContainer from '../../Layouts/MainContainer/MainContainer';
import { Helmet } from 'react-helmet-async';
import styles from './category.module.scss';

const Category = () => {
    const { type } = useParams();
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const categoryMeta = {
        manga: {
            title: 'Japanese Manga',
            desc: 'Explore standard black-and-white panels, rich storytelling, and iconic Japanese manga masterpieces across all genres.',
            langs: ['ja'],
            ratings: ['safe', 'suggestive']
        },
        manhwa: {
            title: 'Korean Manhwa',
            desc: 'Immerse yourself in beautiful full-color layouts, modern webtoon scroll formats, and exciting Korean system/leveling series.',
            langs: ['ko'],
            ratings: ['safe', 'suggestive']
        },
        manhua: {
            title: 'Chinese Manhua',
            desc: 'Discover epic martial arts cultivation, breathtaking historical legends, and gorgeous full-color Chinese artwork.',
            langs: ['zh', 'zh-hk'],
            ratings: ['safe', 'suggestive']
        },
        adult: {
            title: 'Adult (18+)',
            desc: 'Premium content featuring mature romance, explicit scenarios, and dark fantasy narratives tailored for older audiences.',
            langs: [],
            ratings: ['erotica', 'pornographic']
        }
    };

    const currentCat = categoryMeta[type?.toLowerCase()] || categoryMeta.manga;

    useEffect(() => {
        const fetchCategoryData = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await MangaDexApi.getFilteredData(
                    [], // includeIds
                    [], // excludeIds
                    [], // pubDemographic
                    currentCat.ratings, // rating
                    [], // status
                    '', // title
                    'followedCount.desc', // order
                    [], // mangaIds
                    32, // limit
                    0, // offset
                    currentCat.langs // originalLanguage
                );

                if (!response.ok) {
                    throw new Error('Failed to retrieve categories.');
                }

                const data = await response.json();
                setMangas(data.data || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryData();
    }, [type]);

    return (
        <MainContainer mainClasses="suggestion-page" containerClasses="suggest-content" isHeaderBlack>
            <Helmet>
                <meta charSet="utf-8" />
                <title>{currentCat.title} | MangaLive</title>
                <meta name="description" content={currentCat.desc} />
            </Helmet>

            <div className={styles.header}>
                <h1 className={styles.title}>{currentCat.title}</h1>
                <p className={styles.description}>{currentCat.desc}</p>
            </div>

            <div className={styles.content}>
                {loading ? (
                     <div className={styles.spinnerWrapper}>
                         <Spinner customStyle={{ width: '45px', height: '45px', borderColor: '#ff6740' }} />
                     </div>
                ) : error ? (
                    <div className={styles.error}>{error}</div>
                ) : (
                    <Cards mangasArr={mangas} />
                )}
            </div>
        </MainContainer>
    );
};

export default Category;
