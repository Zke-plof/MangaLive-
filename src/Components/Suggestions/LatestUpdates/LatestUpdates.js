import React from 'react';
import styles from './latest-updates.module.scss';
import Img from '../../../SharedUI/StyledComponents/Img/Img';
import { filterSomeAttribute } from '../../../Utils/filterAttribute';
import { cutString } from '../../../Utils/cutString';
import { flags } from '../../../Assets/Svg/Flags';
import Scanlation from '../../../SharedUI/Community/Scanlation/Scanlation';
import { compareDates } from '../../../Utils/compareDates';

const LatestUpdates = ({ chapters }) => {
    return (
        <div className={styles.wrapp}>
            {
                chapters?.data?.map((chapter, idx) => <LatestUpdatesItem key={chapter.id + idx} chapter={chapter} />)
            }
        </div>
    );
};

const LatestUpdatesItem = ({ chapter }) => {
    const coverFileName = filterSomeAttribute(chapter?.relationships, 'cover_art', 'fileName');
    const mangaId = filterSomeAttribute(chapter?.relationships, 'manga')?.id;
    const coverUrl = (coverFileName && coverFileName !== 'No fileName')
        ? `https://uploads.mangadex.org/covers/${mangaId}/${coverFileName}`
        : 'https://placehold.co/400x600?text=No+Cover';

    const titleObj = filterSomeAttribute(chapter?.relationships, 'manga', 'title');
    const displayTitle = titleObj && titleObj !== 'No title'
        ? (titleObj.en || titleObj['ja-ro'] || titleObj.ko || titleObj.zh || Object.values(titleObj)[0] || 'Unknown Title')
        : 'Unknown Title';

    return (
        <div className={styles.item}>
            <div className={styles.img_wrapp}>
                <Img 
                    src={coverUrl} 
                    alt={displayTitle} 
                    classes={styles.img_wrapp} 
                />
            </div>
            <div className={styles.info}>
                <div>
                    <p className={styles.title}>
                        {cutString(displayTitle, 36)}
                    </p>
                </div>
                <div className={styles.translation}>
                    <img src={flags[chapter?.attributes?.translatedLanguage]} alt="" />
                    <p>
                        {
                            cutString(`Vol. ${chapter?.attributes?.volume || 0} Ch. ${chapter?.attributes?.chapter || 0} - ${chapter?.attributes?.title || 'Untitled chapter'}`, 45)
                        }
                    </p>
                </div>
                <div className={styles.scanlation}>
                    <Scanlation name={filterSomeAttribute(chapter?.relationships, 'scanlation_group', 'name')} />
                    <p>{ compareDates(chapter?.attributes?.updatedAt) }</p>
                </div>
            </div>
        </div>
    )
}

export default LatestUpdates;