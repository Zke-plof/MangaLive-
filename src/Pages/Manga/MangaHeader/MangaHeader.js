import React, { memo, useMemo, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

import Cover from '../../../SharedUI/StyledComponents/Cover/Cover';

import TagsStatus from '../../../SharedUI/Statistics/TagsStatus/TagsStatus';
import MangaStatus from '../../../Components/Manga/MangaStatus';

import { Rating, Follows, Seen } from '../../../SharedUI/Statistics';
import { filterSomeAttribute } from '../../../Utils/filterAttribute';
import MangaControls from '../MangaControls/MangaControls';
import { translateTitle } from '../../../Utils/translate';

const MangaHeader = memo(({ mangaInfo = {} }) => {
    const [mangaCoverUrl, setMangaCoverUrl] = useState('');

    const backImage = useMemo(() => {
        if (mangaInfo.data) {
            const coverObj = filterSomeAttribute(mangaInfo.data.relationships, 'cover_art');
            const coverFile = coverObj && coverObj.attributes ? coverObj.attributes.fileName : null;
            const mangaCover = coverFile 
                ? `https://uploads.mangadex.org/covers/${mangaInfo.data.id}/${coverFile}`
                : 'https://placehold.co/400x600?text=No+Cover';
            setMangaCoverUrl(mangaCover);
            return {
                backgroundImage: `url(${mangaCover})`
            }
        }
    }, [mangaInfo])

    return (
        <>
        <Cover 
            src={mangaCoverUrl} 
            alt=''
            classLists={{wrapp: 'manga-cover-cl', img: ''}}
            countryIco={mangaInfo?.data?.attributes?.originalLanguage}
        />
        <MangaTitle mangaInfo={mangaInfo} />
        <MangaIntroduction mangaInfo={mangaInfo} />
        <div className="banner-image" style={backImage}></div>
        </>
    );
});

const MangaTitle = memo(({ mangaInfo }) => {
    const [displayTitle, setDisplayTitle] = useState('');
    const [isTranslated, setIsTranslated] = useState(false);

    const originalTitle = useMemo(() => {
        const titleObj = mangaInfo?.data?.attributes?.title;
        if (!titleObj) return 'Unknown Title';
        return titleObj.en || titleObj['ja-ro'] || titleObj.ko || titleObj.zh || Object.values(titleObj)[0] || 'Unknown Title';
    }, [mangaInfo]);

    useEffect(() => {
        setDisplayTitle(originalTitle);
        setIsTranslated(false);
        
        const titleObj = mangaInfo?.data?.attributes?.title;
        const originalLanguage = mangaInfo?.data?.attributes?.originalLanguage || 'ja';
        
        if (titleObj && !titleObj.en && originalTitle && originalTitle !== 'Unknown Title') {
            (async () => {
                const translated = await translateTitle(originalTitle, originalLanguage);
                if (translated && translated !== originalTitle) {
                    setDisplayTitle(translated);
                    setIsTranslated(true);
                }
            })();
        }
    }, [originalTitle, mangaInfo]);

    const alternative = useMemo(() => {
        const en = mangaInfo?.data?.attributes?.altTitles?.filter(el => el.en)[0]?.en;
        const ja = mangaInfo?.data?.attributes?.altTitles?.filter(el => el.ja)[0]?.ja;
        return en ? en : ja
    }, [mangaInfo]);
    
    return (
        <div className="manga-title" style={{zIndex: '105'}}>
            <div className="manga-title_wrapp">
                <div>
                    <p className="main-title" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                        {displayTitle}
                        {isTranslated && (
                            <span style={{
                                fontSize: '10px',
                                padding: '3px 8px',
                                backgroundColor: '#ff6740',
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                textTransform: 'uppercase',
                                display: 'inline-block',
                                lineHeight: '1.2'
                            }}>
                                Translated
                            </span>
                        )}
                    </p>
                    <p className="second-title">{alternative}</p>
                    <p className='sub-title main-sub-title'>{filterSomeAttribute(mangaInfo?.data?.relationships, 'author', 'name')}</p>
                </div>
                <MangaStatistics statistics={{}} />
            </div>
            <div>
                <p className='sub-title'>{filterSomeAttribute(mangaInfo?.data?.relationships, 'author', 'name')}</p>
            </div>
        </div>
    );
});

const MangaIntroduction = memo(({ mangaInfo }) => {
    const statistics = useSelector(state => state.manga.statistics);

    return (
        <div className="introduction" style={{zIndex: '105'}}>
            <MangaControls mangaInfo={mangaInfo} isAuthorize={false} />
            <MangaVariablesStatus mangaInfo={mangaInfo} />
            <MangaStatistics statistics={statistics.data} />
        </div>
    )
});

const MangaVariablesStatus = memo(({ mangaInfo = {} }) => {
    const tags = useMemo(() => {
        if (mangaInfo.data) {
            return mangaInfo?.data?.attributes?.tags;
        }
    }, [mangaInfo.data]) 

    const status = useMemo(() => {
        if (mangaInfo.data) {
            return mangaInfo?.data?.attributes?.status;
        }
    }, [mangaInfo.data])

    const publicationYear = useMemo(() => {
        if (mangaInfo.data) {
            return mangaInfo?.data?.attributes?.year;
        }
    }, [mangaInfo.data])

    return (
        <div className="manga-var-status">
            <TagsStatus tags={tags} amount={20} />
            <MangaStatus 
                status={status} 
                additionalInfo={`Publication: ${publicationYear},`}
                styles={{
                    textStyles: {textTransform: 'uppercase', fontWeight: 'bold', fontSize: '12px'},
                    blockStyles: {backgroundColor: 'transparent', marginBottom: '5px'}
                }}
            />
        </div>
    )
});

const MangaStatistics = memo(({ statistics = {} }) => {
    const stats = useMemo(() => {
        if (!!statistics) {
            return Object.values(statistics)[0];
        }
    }, [statistics]);

    return stats ? (
        <div className="manga-statistics">
            <Rating rating={stats.rating} details />
            <Follows follows={stats.follows} />
            <Seen statistic={statistics} />
        </div>
    ) : null;
});


export default MangaHeader;