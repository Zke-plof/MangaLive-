import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MangaDexApi from '../../../Services/MangaDexApi';
import Img from '../../../SharedUI/StyledComponents/Img/Img';
import avatar from '../../../Assets/Images/avatar.png';
import './searchPannel.scss';
import { filterSomeAttribute } from '../../../Utils/filterAttribute';
import MangaItem from '../../../Features/SearchItems/MangaItem';

const SearchItem = ({item, type, setActive}) => {
    const [data, setData] = useState({title: '', img: '', status: '', statistics: ''});
    const navigate = useNavigate();
    
    useEffect(() => {
        (async() => {
            let info, imgUrl, statistics;
            if (type === 'Manga') {
                info = await MangaDexApi.getMangaInfo(item?.id).then(data => data.json());
                statistics = await MangaDexApi.getMangaStatistics(item?.id).then(data => data.json());

                const coverFileName = filterSomeAttribute(info?.data?.relationships, 'cover_art', 'fileName');
                imgUrl = coverFileName !== 'No fileName'
                    ? `https://uploads.mangadex.org/covers/${info?.data?.id}/${coverFileName}`
                    : 'https://placehold.co/400x600?text=No+Cover';
                
                const titleObj = info?.data?.attributes?.title;
                const titleVal = titleObj
                    ? titleObj.en || titleObj['ja-ro'] || titleObj.ko || titleObj.zh || Object.values(titleObj)[0] || 'Unknown Title'
                    : 'Unknown Title';
                
                setData({title: titleVal, img: imgUrl, status: info?.data?.attributes?.status, statistics: statistics?.statistics});
            } else if (type === 'Group') {
                setData({title: item?.attributes?.name, img: avatar});
            } else {
                setData({title: item?.attributes?.name, img: avatar});
            }
        })()
    }, [item])

    const handleSearchItem = () => {
        navigate(`/manga/${item?.id}`);
        setActive(false);
        document.body.style.overflow = "";
        document.body.style.paddingRight = "0px";
    }

    const handleUser = () => {
        navigate(`/user/${item?.id}`);
        setActive(false);
    }

    return (
        <div className={type === 'Manga' ? "sch-item-block" : ( type === 'Group' ? "sch-item-block srch-group-block" : "sch-item-block srch-author-block")} 
            onClick={type === 'Manga' ? handleSearchItem : handleUser}
        >
            {
                type === 'Manga' 
                    ?   <div style={{height: '70px', width: '50px', borderRadius: '0.2ch', boxShadow: '0 4px 6px -1px #0000001a, 0 2px 4px -1px#0000000f'}}>
                            <Img src={data.img} alt='title' classes="img-srch" />
                        </div>
                    :   <img src={data.img} alt="title" className="img-srch" />
            }
            <div className="title-srch">
                <div className="title-srch-name">{data.title ?? 'Untitled'}</div>
                {
                    type === 'Manga' 
                    ? <MangaItem status={data?.status} statistics={data.statistics} />
                    : null
                }
            </div>
        </div>
    );
};

export default SearchItem;