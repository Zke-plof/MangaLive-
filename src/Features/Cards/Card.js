import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MangaStatus from '../../Components/Manga/MangaStatus';
import { Comments, Follows, Rating, Seen } from '../../SharedUI/Statistics';
import TagsStatus from '../../SharedUI/Statistics/TagsStatus/TagsStatus';
import Img from '../../SharedUI/StyledComponents/Img/Img';
import { cutString } from '../../Utils/cutString';
import { filterSomeAttribute } from '../../Utils/filterAttribute';
import { strToUpper } from '../../Utils/stringToUpperCase';
import { translateTitle } from '../../Utils/translate';
import styles from './card.module.scss';

const Card = memo(({ handleMangas, manga, mangaInfo, statistics, setRefCover, refCoverStyle, refTitleStyle }) => {
    const [status, setStatus] = useState(false);
    const [translatedTitle, setTranslatedTitle] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);

    const navigate = useNavigate();
    
    const handleManga = () => {
        navigate(`/manga/${manga.id}`)
    }
    
    const handleChoice = () => {
        setStatus(!status);
        handleMangas(manga);
    }

    const originalTitle = mangaInfo ? (mangaInfo.attributes.title.en || mangaInfo.attributes.title['ja-ro'] || mangaInfo.attributes.title.ko || mangaInfo.attributes.title.zh || Object.values(mangaInfo.attributes.title)[0] || 'Unknown Title') : '';
    const hasEnglish = mangaInfo?.attributes?.title?.en;

    const handleTranslate = async (e) => {
        e.stopPropagation();
        if (isTranslating || translatedTitle) return;
        setIsTranslating(true);
        const originalLanguage = mangaInfo?.attributes?.originalLanguage || 'ja';
        const translated = await translateTitle(originalTitle, originalLanguage);
        setTranslatedTitle(translated);
        setIsTranslating(false);
    }

    return (
        <div className={styles.item}>
            <p className={styles.name}>{strToUpper(manga.related)}</p>
            <div className={styles.item_content}>
                <div onClick={handleManga} ref={setRefCover} className={styles.cover + ' ' + refCoverStyle}>
                    <Img 
                        src={
                            filterSomeAttribute(mangaInfo?.relationships, 'cover_art', 'fileName') !== 'No fileName'
                                ? `https://uploads.mangadex.org/covers/${mangaInfo?.id}/${filterSomeAttribute(mangaInfo?.relationships, 'cover_art', 'fileName')}`
                                : 'https://placehold.co/400x600?text=No+Cover'
                        } 
                        alt='' 
                    />
                </div>
                <div className={styles.description}>
                    <div className={styles.title + ' ' + refTitleStyle}>
                        <div onClick={handleManga} className={styles.manganame} style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            {cutString(translatedTitle || originalTitle, 32)}
                            {!hasEnglish && !translatedTitle && (
                                <button 
                                    onClick={handleTranslate}
                                    disabled={isTranslating}
                                    style={{
                                        border: 'none',
                                        background: '#f0f1f2',
                                        cursor: 'pointer',
                                        fontSize: '8px',
                                        padding: '2px 5px',
                                        borderRadius: '4px',
                                        color: '#ff6740',
                                        fontWeight: 'bold',
                                        transition: 'all 0.2s',
                                        display: 'inline-flex',
                                        alignItems: 'center'
                                    }}
                                    title="Translate Title"
                                >
                                    {isTranslating ? '...' : '🌐 Translate'}
                                </button>
                            )}
                        </div>
                        <div className={styles.statistics}>
                            {statistics 
                                ? <>
                                  <Rating rating={statistics.rating} />
                                  <Follows follows={statistics.follows} />
                                  <Seen statistic={[]} />
                                  <Comments statistic={[]} />
                                  </>
                                : null
                            }
                            <MangaStatus 
                                status={mangaInfo?.attributes?.status} 
                                styles={{textStyles: { fontSize: '.9rem' }}}
                            />
                        </div>
                    </div>
                        <div>
                            <TagsStatus 
                                tags={mangaInfo?.attributes?.tags} 
                                amount={20}
                                customStyles={{backgroundColor: 'white'}}
                            />
                    </div>
                    <div className={styles.main_title}>
                        {
                            cutString(mangaInfo?.attributes?.description?.en, 450)
                        }
                    </div>
                </div>
            </div>
            {handleMangas
                ? <div onClick={handleChoice} className={status ? styles.minus : styles.plus}>
                      {status ? '-' : '+' }
                  </div>
                : null
            }
        </div>
    );
});

export default Card;