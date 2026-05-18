import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setReaderStatus } from '../../Store/Slices/menuSlice';
import { useParams } from 'react-router-dom';
import './reader-page.scss';

import SideMenu from '../../Features/SideMenu/SideMenu';
import SideReader from './SideReader/SideReader';
import Spinner from '../../SharedUI/LoadComponents/Spiner/Spinner';

import MangaDexApi from '../../Services/MangaDexApi';
import { Helmet } from 'react-helmet-async';

const getSortedKeys = (obj = {}) => {
	return Object.keys(obj).sort((a, b) => {
		const aNumber = Number(a);
		const bNumber = Number(b);

		if (Number.isNaN(aNumber) && Number.isNaN(bNumber)) return a.localeCompare(b);
		if (Number.isNaN(aNumber)) return 1;
		if (Number.isNaN(bNumber)) return -1;

		return aNumber - bNumber;
	});
};

const getFirstChapter = (volumes = {}) => {
	const volume = getSortedKeys(volumes)[0];
	const chapter = getSortedKeys(volumes?.[volume]?.chapters)[0];

	if (!volume || !chapter) return null;

	return { volume, chapter, counter: 1 };
};

const Read = () => {
	const params = useParams();
	const pathParams = params['*'] ? params['*'].split('/') : [];
	const mangaId = pathParams[0];
	const urlVolume = pathParams[1];
	const urlChapter = pathParams[2];

	const clientHeight = document.documentElement.clientHeight - 20;
	const clientWidth = document.documentElement.clientWidth;

	const [mangaVolumes, setMangaVolumes] = useState([]);
	const [mangaTitle, setMangaTitle] = useState('');
	const [chapterTitle, setChapterTitle] = useState('');
	const [readerError, setReaderError] = useState('');
	const [currentChapter, setCurrentChapter] = useState({
		volume: '',
		chapter: '',
		counter: 1,
		currImg: 1,
		maxImg: 1,
	});
	const [images, setImages] = useState([]);
	const [readMode, setReadMode] = useState(() => {
		return localStorage.getItem('readMode') || 'single';
	});

	const handleReadModeChange = (mode) => {
		setReadMode(mode);
		localStorage.setItem('readMode', mode);
	};

	const dispatch = useDispatch();
	const menu = useSelector((store) => store.menu.readerMenu);

	useEffect(() => {
		(async () => {
			const mangaName = await MangaDexApi.getMangaInfo(mangaId).then((data) =>
				data.json()
			);
			setMangaTitle(
				mangaName?.data?.attributes?.title?.en ||
					mangaName?.data?.attributes?.title?.['ja-ro']
			);
		})();
	}, [mangaId]);

	const fetchChapterHash = async (volume, chapter) => {
		const chapterData = mangaVolumes?.[volume]?.chapters?.[chapter];
		if (!chapterData) return;

		const chaptersIds = [
			...(chapterData?.others || []),
			chapterData?.id,
		].filter(Boolean);
		if (chaptersIds.length === 0) return;

		try {
			const chaterInfoArr = await MangaDexApi.getInfoAboutChapter(chaptersIds);

			const findChapterByLang = (chapters, lang) => {
				for (let i = 0; i < lang.length; i++) {
					const chapterId = chapters.findIndex(
						(el) => el?.data?.attributes?.translatedLanguage === lang[i]
					);
					if (chapterId !== -1) {
						return chapterId;
					}
				}
				return -1;
			};

			let chapterLangId = findChapterByLang(chaterInfoArr, ['en', 'uk', 'ru']);
			if (chapterLangId === -1 || chapterLangId === undefined) {
				chapterLangId = 0;
			}

			const chapterId = chaptersIds[chapterLangId] || chaptersIds[0];
			if (!chapterId) {
				setReaderError('Failed to locate chapter ID.');
				return;
			}

			const chapterHash = await MangaDexApi.getChapterHash(chapterId);
			const chapterName = await MangaDexApi.getInfoAboutChapter([chapterId]);

			setChapterTitle(chapterName[0]?.data?.attributes?.title || `Chapter ${chapter}`);

			const useDataSaver = false; // Always use original high-definition pages for crisp premium quality
			const chapterPages = chapterHash?.chapter?.data || [];

			if (chapterPages.length === 0) {
				setReaderError('This chapter has no MangaDex-hosted pages.');
				setImages([]);
				return;
			}

			const mdBaseUrl = 'https://uploads.mangadex.org';
			const folder = 'data'; // Force original resolution
			const images = chapterPages.map(
				(el) => `${mdBaseUrl}/${folder}/${chapterHash?.chapter?.hash}/${el}`
			);

			setReaderError('');
			setImages(images);

			setCurrentChapter((currentChapter) => ({
				...currentChapter,
				currImg: 1,
				maxImg: images?.length || 1,
			}));
		} catch (err) {
			console.error("Failed to load chapter pages from MangaDex:", err);
			setReaderError("MangaDex is currently rate-limiting or blocking requests. Try refreshing or wait a few seconds.");
			setImages([]);
		}
	};

	// 🚀 Asynchronous Background Pre-fetcher for all pages of the chapter!
	useEffect(() => {
		if (images && images.length > 0) {
			console.log(`Starting background prefetcher for ${images.length} pages...`);
			let active = true;

			const prefetchImages = async () => {
				// Wait 600ms before starting background pre-fetching, so Page 1 gets 100% of the active connection!
				await new Promise(resolve => setTimeout(resolve, 600));
				if (!active) return;

				for (let i = 1; i < images.length; i++) {
					if (!active) break;
					const imgUrl = images[i];
					// Create an offline Image object to force browser network cache!
					const imgObj = new Image();
					imgObj.src = imgUrl;
					// Tiny delay (40ms) between triggers so we don't spam the browser thread
					await new Promise(resolve => setTimeout(resolve, 40));
				}
				console.log("All pages pre-cached successfully!");
			};

			prefetchImages();

			return () => {
				active = false;
			};
		}
	}, [images]);

	useEffect(() => {
		const header = document.querySelector('.header-block');

		if (menu.status) {
			header.style.position = 'sticky';
		} else {
			header.style.position = 'relative';
		}
		return () => {
			header.style.position = 'sticky';
		};
	}, [menu]);

	useEffect(() => {
		const fetchVolumes = async () => {
			const readableVolumes = await MangaDexApi.getReadableMangaChapters(mangaId);

			if (!readableVolumes || Object.keys(readableVolumes).length === 0) {
				const mangaInfo = await MangaDexApi.getMangaInfo(mangaId).then((data) =>
					data.json()
				);
				const someOtherIds = mangaInfo?.data?.relationships;
				const newMangaId =
					someOtherIds[
						someOtherIds?.findIndex((el) => el?.related === 'colored')
					]?.id;
				const nextVolumes = newMangaId ? await MangaDexApi.getReadableMangaChapters(newMangaId) : {};
				setMangaVolumes(nextVolumes);

				const initialVolume = urlVolume;
				const initialChapter = urlChapter;
				const hasInitial = initialVolume && initialChapter && nextVolumes?.[initialVolume]?.chapters?.[initialChapter];

				let firstChapter;
				if (hasInitial) {
					const chapterKeys = getSortedKeys(nextVolumes?.[initialVolume]?.chapters);
					const chapterIndex = chapterKeys.indexOf(initialChapter);
					const counter = chapterIndex !== -1 ? chapterIndex + 1 : 1;
					firstChapter = { volume: initialVolume, chapter: initialChapter, counter };
				} else {
					firstChapter = getFirstChapter(nextVolumes);
				}

				if (firstChapter) {
					setCurrentChapter((currentChapter) => ({
						...currentChapter,
						...firstChapter,
					}));
					setReaderError('');
				} else {
					setReaderError('No MangaDex-hosted readable chapters were found for this title.');
				}
			} else {
				setMangaVolumes(readableVolumes);

				const initialVolume = urlVolume;
				const initialChapter = urlChapter;
				const hasInitial = initialVolume && initialChapter && readableVolumes?.[initialVolume]?.chapters?.[initialChapter];

				let firstChapter;
				if (hasInitial) {
					const chapterKeys = getSortedKeys(readableVolumes?.[initialVolume]?.chapters);
					const chapterIndex = chapterKeys.indexOf(initialChapter);
					const counter = chapterIndex !== -1 ? chapterIndex + 1 : 1;
					firstChapter = { volume: initialVolume, chapter: initialChapter, counter };
				} else {
					firstChapter = getFirstChapter(readableVolumes);
				}

				if (firstChapter) {
					setCurrentChapter((currentChapter) => ({
						...currentChapter,
						...firstChapter,
					}));
					setReaderError('');
				}
			}
		};
		fetchVolumes();
	}, [mangaId, urlVolume, urlChapter]);

	useEffect(() => {
		if (currentChapter.volume && currentChapter.chapter && mangaVolumes?.[currentChapter.volume]?.chapters?.[currentChapter.chapter]) {
			fetchChapterHash(
				currentChapter.volume,
				currentChapter.chapter
			);
		}
	}, [currentChapter.volume, currentChapter.chapter, mangaVolumes]);

	useEffect(() => {
		if (images.length === 0) return;
		const preloadRange = 3;
		const startIndex = currentChapter.currImg - 1;
		for (let i = 1; i <= preloadRange; i++) {
			const targetIndex = startIndex + i;
			if (targetIndex < images.length) {
				const img = new Image();
				img.src = images[targetIndex];
			}
		}
	}, [currentChapter.currImg, images]);

	const mangaContentDelegate = (e) => {
		if (readMode === 'scroll') return;

		const leftBorder = clientWidth / 2.3;
		const rightBorder = clientWidth / 2 + (clientWidth / 2 - leftBorder);

		if (e.pageX > leftBorder && e.pageX < rightBorder) {
		} else if (e.pageX > rightBorder) {
			handleNextImg();
		} else {
			handlePrevImg();
		}
	};

	const handleNextImg = () => {
		document.documentElement.scrollTop = document.documentElement.scrollHeight;

		const volumeKeys = getSortedKeys(mangaVolumes);
		const volumeIndex = volumeKeys.indexOf(currentChapter.volume);
		const chapterKeys = getSortedKeys(mangaVolumes?.[currentChapter.volume]?.chapters);
		const chapterIndex = chapterKeys.indexOf(currentChapter.chapter);

		if (currentChapter.currImg === currentChapter.maxImg && chapterIndex + 1 < chapterKeys.length) {
			const nextChapter = chapterKeys[chapterIndex + 1];
			setCurrentChapter((currentChapter) => ({
				...currentChapter,
				chapter: nextChapter,
				counter: chapterIndex + 2,
				currImg: 1,
				maxImg: 1,
			}));
			setImages([]);
		} else if (currentChapter.currImg === currentChapter.maxImg && volumeIndex + 1 < volumeKeys.length) {
			const nextVolume = volumeKeys[volumeIndex + 1];
			const nextChapter = getSortedKeys(mangaVolumes?.[nextVolume]?.chapters)[0];
			setCurrentChapter((currentChapter) => ({
				volume: nextVolume,
				chapter: nextChapter,
				counter: 1,
				currImg: 1,
				maxImg: 1,
			}));
			setImages([]);
		} else {
			setCurrentChapter((currentChapter) => ({
				...currentChapter,
				currImg: currentChapter.currImg + 1,
			}));
		}
	};

	const handlePrevImg = () => {
		document.documentElement.scrollTop = document.documentElement.scrollHeight;

		const volumeKeys = getSortedKeys(mangaVolumes);
		const volumeIndex = volumeKeys.indexOf(currentChapter.volume);
		const chapterKeys = getSortedKeys(mangaVolumes?.[currentChapter.volume]?.chapters);
		const chapterIndex = chapterKeys.indexOf(currentChapter.chapter);

		if (currentChapter.currImg === 1 && chapterIndex > 0) {
			const prevChapter = chapterKeys[chapterIndex - 1];
			setCurrentChapter({
				...currentChapter,
				chapter: prevChapter,
				counter: chapterIndex,
				currImg: 1,
				maxImg: 1,
			});
			setImages([]);
		} else if (currentChapter.currImg === 1 && volumeIndex > 0) {
			const prevVolume = volumeKeys[volumeIndex - 1];
			const prevChapterKeys = getSortedKeys(mangaVolumes?.[prevVolume]?.chapters);
			const prevChapter = prevChapterKeys[prevChapterKeys.length - 1];
			setCurrentChapter({
				...currentChapter,
				volume: prevVolume,
				chapter: prevChapter,
				counter: prevChapterKeys.length,
				currImg: 1,
				maxImg: 1,
			});
			setImages([]);
		} else {
			setCurrentChapter({
				...currentChapter,
				currImg: currentChapter.currImg - 1,
			});
		}
	};

	const handleMenu = () => {
		dispatch(setReaderStatus(!menu.status));
	};

	const handleChapter = (volume, chapter, counter) => {
		setCurrentChapter({
			volume: String(volume),
			chapter: String(chapter),
			counter: +counter,
			currImg: 1,
			maxImg: 1,
		});
		setImages([]);
	};

	const handleImage = (image) => {
		setCurrentChapter({
			...currentChapter,
			currImg: image,
		});
	};

	return (
		<main className="chapter-page">
			<Helmet>
				<meta charSet="utf-8" />
				<title>{`${mangaTitle || 'Manga'} - ${chapterTitle || 'Chapter'} | MangaLive`}</title>
				<meta
					name="description"
					content={`Read ${mangaTitle || 'manga'} ${chapterTitle || 'Chapter'} online for free on MangaLive. Premium distraction-free reading experience.`}
				/>
			</Helmet>
			<div className="chapter-title">
				<div className="chapter-description">
					<p className="chapter-name">{chapterTitle}</p>
					<p className="manga-name">{mangaTitle}</p>
				</div>
				<div className="read-progress-info">
					<div className="c-vol">{`Vol. ${currentChapter?.volume}
                        Ch. ${currentChapter.chapter}`}</div>
					<div className="c-pg">
						{readMode === 'scroll' ? `Scroll (${currentChapter.maxImg} Pgs)` : `Pg. ${currentChapter.currImg}/${currentChapter.maxImg}`}
					</div>
					<div className="c-menu" onClick={handleMenu}>
						Menu
					</div>
				</div>
				<p className="translator">Some guy's scans</p>
			</div>
			<div
				className={`chapter-content ${readMode === 'scroll' ? 'scroll-mode' : ''}`}
				style={readMode === 'scroll' ? { maxHeight: 'none' } : { maxHeight: clientHeight }}
				onClick={mangaContentDelegate}
			>
				{images && images.length > 0 ? (
					readMode === 'scroll' ? (
						images.map((el, idx) => (
							<img
								referrerPolicy="no-referrer"
								src={el}
								key={el}
								alt={`img-${idx}`}
							/>
						))
					) : (
						images?.map((el, idx) => {
							const isCurrent = idx + 1 === currentChapter.currImg;
							const isPrefetchWindow = idx + 1 > currentChapter.currImg && idx + 1 <= currentChapter.currImg + 2;

							if (isCurrent) {
								return (
									<img
										referrerPolicy="no-referrer"
										src={el}
										style={{
											maxHeight: clientHeight,
											maxWidth: clientWidth - 40,
										}}
										key={el}
										alt={`img-${idx}`}
									/>
								);
							} else if (isPrefetchWindow) {
								return (
									<img
										referrerPolicy="no-referrer"
										src={el}
										style={{
											display: 'none',
										}}
										key={el}
										alt={`img-${idx}`}
									/>
								);
							}
							return null;
						})
					)
				) : readerError ? (
					<div style={{ minHeight: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 20px' }}>
						<p>{readerError}</p>
					</div>
				) : (
					<div style={{ height: '55vh' }}>
						<Spinner
							customStyle={{
								width: '47px',
								height: '47px',
								borderColor: '#ff6740',
							}}
						/>
					</div>
				)}
			</div>
			<SideMenu options={{ menuType: 'reader' }}>
				<SideReader
					data={mangaVolumes}
					handleChapter={handleChapter}
					currentChapter={currentChapter}
					mangaTitle={mangaTitle}
					currImg={currentChapter.currImg}
					maxImg={currentChapter.maxImg}
					handleImage={handleImage}
					readMode={readMode}
					setReadMode={handleReadModeChange}
				/>
			</SideMenu>
		</main>
	);
};

export default Read;
