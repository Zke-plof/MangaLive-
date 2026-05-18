import React, { memo, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
	fetchMangaCovers,
	fetchMangaFeed,
	fetchMangaInfo,
	fetchMangaStatistics,
} from '../../Store/Slices/mangaSlice';
import './mangaPage.scss';

import MangaHeader from './MangaHeader/MangaHeader';
import MangaSynopsis from './MangaSynopsis/MangaSynopsis';
import MangaContent from './MangaContent/MangaContent';
import MainContainer from '../../Layouts/MainContainer/MainContainer';
import { Helmet } from 'react-helmet-async';

const Manga = memo(() => {
	const params = useParams();
	const mangaId = useMemo(() => params.id, [params]);

	const dispatch = useDispatch();
	const mangaInfo = useSelector((state) => state.manga.mangaInfo);

	const title = useMemo(
		() =>
			mangaInfo?.data?.attributes?.title[
				Object.keys(mangaInfo?.data?.attributes?.title)[0]
			],
		[mangaInfo]
	);

	useEffect(() => {
		dispatch(fetchMangaInfo({ mangaId }));
		dispatch(fetchMangaStatistics({ mangaId }));
		dispatch(fetchMangaCovers({ mangaId }));
		dispatch(fetchMangaFeed({ mangaId }));
	}, [mangaId]);

	return (
		<MainContainer mainClasses="manga-page" containerClasses="manga-container">
			<Helmet>
				<meta charSet="utf-8" />
				<title>{`${title || 'Manga'} | MangaLive`}</title>
				<meta name="description" content={`Read ${title || 'manga'} online for free on MangaLive. Explore chapters, statistics, art, reviews, and more.`} />
			</Helmet>
			<MangaHeader mangaInfo={mangaInfo} />
			<MangaSynopsis
				description={mangaInfo?.data?.attributes?.description?.en}
			/>
			<MangaContent mangaId={mangaId} mangaInfo={mangaInfo} />
		</MainContainer>
	);
});

export default Manga;
