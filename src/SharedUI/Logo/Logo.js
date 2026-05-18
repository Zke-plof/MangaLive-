import React from 'react';
import styles from './logo.module.scss';

import { MenuLinesIco, MenuCrossIco } from '../../Assets/Svg/Menu';
import { Link } from 'react-router-dom';

const Logo = ({ handleMenu, ico }) => {
    const renderLogoLink = () => (
        <Link to={"/"} className={styles.logoLink}>
            <svg className={styles.logoIcon} viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="logoBrandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ff3b30" />
                        <stop offset="50%" stopColor="#ff6740" />
                        <stop offset="100%" stopColor="#ff9500" />
                    </linearGradient>
                </defs>
                <path d="M120 370 Q160 380 200 370 T280 370 Q320 380 360 370 V150 Q320 160 280 150 T200 150 Q160 160 120 150 Z" fill="#ff6740" fillOpacity="0.15" />
                <path d="M120 360 L120 180 C120 160 135 150 150 160 L230 220 C245 230 256 220 256 200 L256 160" stroke="url(#logoBrandGrad)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M392 360 L392 180 C392 160 377 150 362 160 L282 220 C267 230 256 220 256 200 L256 160" stroke="url(#logoBrandGrad)" strokeWidth="42" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M256 180 V370" stroke="#ff6740" strokeWidth="26" strokeLinecap="round" />
            </svg>
            <h1 className={styles.logoTitle}>MangaLive</h1>
        </Link>
    );

    return (
        <div id="logo" className={ico.type === 'open' ? styles.logo : styles.logo + " " + styles.logo_side_main}>
            {ico.side === 'left'
                ? <>
                  {ico.type === 'open' 
                    ? <MenuLinesIco onClick={handleMenu} />
                    : <MenuCrossIco onClick={handleMenu} /> 
                  }
                  {renderLogoLink()}
                  </>
                : <>
                  {renderLogoLink()}
                  { ico.type === 'close'
                    ? <MenuCrossIco onClick={handleMenu} />
                    : <MenuLinesIco onClick={handleMenu} /> 
                  }
                  </>
            }
        </div>
    );
};

export default Logo;