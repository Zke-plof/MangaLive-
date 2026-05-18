import React, { useRef, useMemo } from 'react';
import { flags } from '../../../Assets/Svg/Flags';
import Img from '../../../SharedUI/StyledComponents/Img/Img';
import './mangaVariables.scss';

const MangaVar2 = ({ manga, mangaCover }) => {
    const ref = useRef();

    const title = useMemo(() => {
        const titleObj = manga?.attributes?.title;
        if (!titleObj) return 'Unknown Title';
        const rawTitle = titleObj.en || titleObj['ja-ro'] || titleObj.ko || titleObj.zh || Object.values(titleObj)[0] || 'Unknown Title';
        return rawTitle.slice(0, 25);
    }, [manga])

    return (
        <div style={{display: "block"}} ref={ref}>
            <div className="manga-img-var2">
                <Img src={mangaCover} alt='' draggable={false} />
                <div className="flag-img-var2">
                    <img src={flags[manga?.attributes?.originalLanguage]} alt="" />
                </div>
            </div>
            <div className="manga-de-var2">
                <p>{title}</p>
            </div>
        </div>   
    );
};

export default MangaVar2;