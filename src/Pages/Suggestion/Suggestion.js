import { memo, useEffect } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
	fetchLatestUpdates,
	fetchRecentlyAdded,
	fetchSeasonal,
} from '../../Store/Slices/suggestSlice';

import MainContainer from '../../Layouts/MainContainer/MainContainer';
import SuggestItem from './SuggestItem';

import MangaItems from '../../Components/Manga/MangaVariables/MangaItems';
import LatestUpdates from '../../Components/Suggestions/LatestUpdates/LatestUpdates';
import './suggestion.scss';

import Slider from '../../Features/Slider/Slider';
import SliderItem from '../../Features/Slider/SliderItem';

import MangaVar1 from '../../Components/Manga/MangaVariables/MangaVar1';
import MangaVar2 from '../../Components/Manga/MangaVariables/MangaVar2';
import Spinner from '../../SharedUI/LoadComponents/Spiner/Spinner';
import { Helmet } from 'react-helmet-async';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faShieldHalved, faImage, faTv } from '@fortawesome/free-solid-svg-icons';

const Suggestion = memo(() => {
	const dispatch = useDispatch();

	const seasonal = useSelector((state) => state.suggest.seasonal);
	const latestUpdates = useSelector((state) => state.suggest.latestUpdates);
	const recentlyAdded = useSelector((state) => state.suggest.recentlyAdded);

	useEffect(() => {
		dispatch(fetchSeasonal());
		dispatch(fetchLatestUpdates());
		dispatch(fetchRecentlyAdded());
	}, []);

	return (
		<MainContainer
			mainClasses="suggestion-page"
			containerClasses="suggest-content"
			isHeaderBlack
		>
			<Helmet>
				<meta charSet="utf-8" />
				<title>MangaLive - Read Manga Online Free</title>
				<meta name="description" content="Explore a massive collection of free manga online on MangaLive. Get daily updates, high-quality pages, and personalized lists with our beautiful, modern reader." />
			</Helmet>

			<div className="hero-showcase">
				<span className="hero-tag">The MangaLive Advantage</span>
				<h1 className="hero-title">Experience Manga <span>Like Never Before</span></h1>
				<p className="hero-subtitle">
					MangaLive is built by fans, for fans, to deliver the absolute ultimate reading experience online. Discover why readers are switching to us.
				</p>
				
				<div className="features-grid">
					<div className="feature-card">
						<div className="feature-icon-wrapper">
							<FontAwesomeIcon icon={faBolt} />
						</div>
						<h3 className="feature-card-title">Instant-Load Reader</h3>
						<p className="feature-card-desc">
							Our smart background pre-fetching technology pre-caches upcoming pages as you read. Zero delays, zero loading screens, just pure reading.
						</p>
					</div>

					<div className="feature-card">
						<div className="feature-icon-wrapper">
							<FontAwesomeIcon icon={faShieldHalved} />
						</div>
						<h3 className="feature-card-title">Ad-Free & Clean UI</h3>
						<p className="feature-card-desc">
							Forget intrusive popups, shady redirects, and malicious trackers. Enjoy a 100% clean, distraction-free environment styled with modern glassmorphic aesthetics.
						</p>
					</div>

					<div className="feature-card">
						<div className="feature-icon-wrapper">
							<FontAwesomeIcon icon={faImage} />
						</div>
						<h3 className="feature-card-title">Original Source Quality</h3>
						<p className="feature-card-desc">
							We never compress or downscale your favorite manga panels. Get access to crystal-clear, high-definition original source scans for a pixel-perfect presentation.
						</p>
					</div>

					<div className="feature-card">
						<div className="feature-icon-wrapper">
							<FontAwesomeIcon icon={faTv} />
						</div>
						<h3 className="feature-card-title">Anime & Manga Hub</h3>
						<p className="feature-card-desc">
							Seamlessly track your favorite manga series and browse upcoming seasonal anime adaptation details within our unified catalog portal.
						</p>
					</div>
				</div>
			</div>

			<SuggestItem title="Seasonal" link="titles/seasonal">
				{seasonal.load.status === 'loading' ? (
					<Spinner customStyle={{ width: '50px', height: '50px' }} />
				) : (
					<Slider>
						<MangaItems
							mangas={seasonal?.data}
							Variant={MangaVar1}
							Wrapp={SliderItem}
							styles={{ display: 'flex', height: '228px' }}
						/>
					</Slider>
				)}
			</SuggestItem>

			<SuggestItem title="Latest Updates" link="">
				<LatestUpdates chapters={latestUpdates?.data} />
			</SuggestItem>

			<SuggestItem title="Recently added" link="titles/recently">
				{recentlyAdded.load.status === 'loading' ? (
					<Spinner customStyle={{ width: '50px', height: '50px' }} />
				) : (
					<Slider>
						<MangaItems
							mangas={recentlyAdded?.data}
							Variant={MangaVar2}
							Wrapp={SliderItem}
							styles={{ display: 'flex', width: '128px', height: '180px' }}
						/>
					</Slider>
				)}
			</SuggestItem>
		</MainContainer>
	);
});

export default Suggestion;
