import React from 'react';

const MangaItems = ({mangas = [], Variant, Wrapp = true, styles = {}}) => {
    return (
        mangas?.map((item) => {
            const coverObj = item?.relationships?.find(el => el.type === 'cover_art');
            const coverFile = coverObj && coverObj.attributes ? coverObj.attributes.fileName : null;
            const mangaCover = coverFile 
                ? `https://uploads.mangadex.org/covers/${item.id}/${coverFile}`
                : 'https://placehold.co/400x600?text=No+Cover';

            return (
                <Wrapp key={item.id} styles={styles} manga={item}>
                    <Variant manga={item} mangaCover={mangaCover} />
                </Wrapp>
            );
        })
    );
};

export default MangaItems;